import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';
import { OpenAI } from 'openai';
import { parse } from 'json2csv';
import fs from 'fs';
import path from 'path';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractRawTextFromImage(buffer) {
  const params = {
    Document: { Bytes: buffer }
  };

  const command = new DetectDocumentTextCommand(params);
  const response = await textract.send(command);
  const blocks = response.Blocks;

  let extractedText = "";
  blocks.forEach(block => {
    if (block.BlockType === "LINE") {
      extractedText += block.Text + "\n";
    }
  });

  return extractedText;
}

async function extractStructuredDataFromText(extractedText) {
  const prompt = `
  I have the following invoice text extracted from AWS Textract:
  "${extractedText}"
  
  Please extract and return the following details in **valid JSON format** without any other narrative:
  1. Customer's GSTIN
  2. E-Way Bill Number and its Expiry Date
  3. Order details (including items, quantities, and prices)
  4. Supplier details (name, GSTIN, address)
  
  Return **only** the JSON object as shown below, without any other explanation:
  {
    "customer_details": {
      "gstin": "GSTIN",
      "address": "customer address"
      "eway_bill": {
        "number": "E-WAY BILL NO.",
        "expiry_date": "EXPIRY DATE"
      },
      "order_details": [
        {
          "item": "ITEM NAME",
          "quantity": "QUANTITY",
          "price": "PRICE"
        }
      ],
    },
    "supplier_details": {
      "name": "SUPPLIER NAME",
      "gstin": "SUPPLIER GSTIN",
      "address": "SUPPLIER ADDRESS"
    }
  }
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",  
    messages: [
      {
        role: "system",
        content: "You are an assistant trained to extract invoice information."
      },
      {
        role: "user",
        content: prompt
      }
    ],
  });

  const responseText = completion.choices[0].message.content;

  let structuredData = {};

  try {
    structuredData = JSON.parse(responseText);
  } catch (err) {
    console.error("Error parsing OpenAI response as JSON:", err);
    throw new Error("Failed to parse OpenAI response into JSON.");
  }

  return structuredData;
}


const storage = multer.memoryStorage();
const upload = multer({ storage }).single('invoice');

const multifileUploade = multer({ storage }).array('files', 10);

export const uploadInvoiceGetData = (req, res) => {
  console.time("TotalTime");

  upload(req, res, async function (err) {
    console.timeEnd("TotalTime");

    if (err) {
      return res.status(500).json({ error: "Multer error", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const file = req.file;
      const currentDate = new Date().toISOString().split("T")[0]; 
      const uniqueSuffix = randomUUID();
      const folderPath = `invoices/${currentDate}-${uniqueSuffix}`;
      const fileKey = `${folderPath}/${file.originalname}`;


      console.time("S3Upload");
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
      });
      await s3.send(command);
      console.timeEnd("S3Upload");

      console.time("Textract");
      const extractedText = await extractRawTextFromImage(file.buffer);
      console.log("Extracted Invoice Text:", extractedText);
      console.timeEnd("Textract");

      console.time("OpenAI");
      const structuredText = await extractStructuredDataFromText(extractedText);
      console.log("Extracted Structured Data (Plain Text):\n", structuredText);
      console.timeEnd("OpenAI");


      return res.status(200).json({
        message: "Invoice uploaded and data extracted",
        data: {
          invoiceKey: fileKey,
          invoiceFileName: file.originalname
        },
        structuredData: structuredText
      });

    } catch (err) {
      console.error("Upload or Textract error:", err);
      return res.status(500).json({
        error: "Upload or Textract failed",
        details: err.message
      });
    }
  });
};


export const uploadeInvoiceDemoData = (req, res) => {
  console.time("TotalTime");

  upload(req, res, function (err) {
    console.timeEnd("TotalTime");

    if (err) {
      return res.status(500).json({ error: "Multer error", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileKey = `invoices/${Date.now()}-${file.originalname}`;


    return res.status(200).json(
      {
        "message": "Invoice uploaded and data extracted",
        "data": {
            "invoiceKey": "invoices/1750410711547-Consignor invoice.jpeg",
            "invoiceFileName": "Consignor invoice.jpeg"
        },
        "structuredData": {
            "customer_details": {
                "gstin": "23AEIPR5571B1ZM",
                "address": "43, Mukadamganj Galgala Jabalpur, Madya Pradesh",
                "eway_bill": {
                    "number": "111945489327",
                    "expiry_date": "Not provided"
                },
                "order_details": [
                    {
                        "item": "ARECANUT AREGERE",
                        "quantity": "1750",
                        "price": "558,338.00"
                    }
                ]
            },
            "supplier_details": {
                "name": "SPANDAN ENTERPRISES",
                "gstin": "29ALYPM9169K1ZR",
                "address": "Betelnut Merchants, Alvekodi., KUMTA-581343"
            }
        }
    });
  });
};



export const uploadAdditionalDocs = async (req, res) => {
  console.time("TotalTime");
 
  multifileUploade(req, res, async function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
    }
    const { invoiceKey } = req.body;

    const files = req.files;
    const folderPath = invoiceKey.substring(0, invoiceKey.lastIndexOf('/'));

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    try {
      console.time("S3Upload");

      const uploadedFiles = [];

      for (const file of files) {
        const fileKey = `${folderPath}/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await s3.send(command);

        uploadedFiles.push({
          fileName: file.originalname,
          fileKey,
          url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`,
        });
      }

      console.timeEnd("S3Upload");

      return res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        data: {
          invoiceKey,
          invoiceFileName: invoiceKey.split('/').pop()
        },
        files: uploadedFiles
      });

    } catch (uploadError) {
      console.error("S3 upload error:", uploadError);
      return res.status(500).json({ success: false, message: 'S3 upload failed', error: uploadError.message });
    } finally {
      console.timeEnd("TotalTime");
    }
  });
};

export const createOrderConsignorConsignee = async (req, res) => {
  try {
    const { transporterId, invoicefile, structuredData } = req.body;
    console.log("invoicefile",invoicefile.invoiceKey)
    // console.log("transporterId",transporterId)
    // console.log("structuredData",structuredData)

    if (!transporterId || !structuredData?.customer_details?.gstin || !structuredData?.supplier_details?.gstin) {
      return res.status(400).json({ error: "Missing required GSTIN or transporterId" });
    }

    const consigneeGSTIN = structuredData.customer_details.gstin;
    const consignorGSTIN = structuredData.supplier_details.gstin;
    // console.log("consigneeGSTIN",consigneeGSTIN)
    // console.log("consignorGSTIN",consignorGSTIN)

    let consignor = await prisma.consignorConsignee.findFirst({
      where: {
        gstin: consignorGSTIN,
        type: "CONSIGNOR"
      }
    });

    if (!consignor) {
      consignor = await prisma.consignorConsignee.create({
        data: {
          gstin: consignorGSTIN,
          type: "CONSIGNOR",
          name: structuredData.supplier_details.name,
          address: structuredData.supplier_details.address,
          transporterId: transporterId,

          pan: "",
          aadhaar: "",
          mobileNo: "",
          partyBillingType: "",
          ratePeriod: "",
          labourChargeIncluded: false,
          biltyChargeIncluded: false,
          accountNo: "",
          ifscCode: "",
          upiIdOrMobileNo: ""
        }
      });
    }

    let consignee = await prisma.consignorConsignee.findFirst({
      where: {
        gstin: consigneeGSTIN,
        type: "CONSIGNEE"
      }
    });

    if (!consignee) {
      consignee = await prisma.consignorConsignee.create({
        data: {
          gstin: consigneeGSTIN,
          type: "CONSIGNEE",
          name: "", 
          address: "",
          transporterId: transporterId,

          pan: "",
          aadhaar: "",
          mobileNo: "",
          partyBillingType: "",
          ratePeriod: "",
          labourChargeIncluded: false,
          biltyChargeIncluded: false,
          accountNo: "",
          ifscCode: "",
          upiIdOrMobileNo: ""
        }
      });
    }


    const transporter = await prisma.transporter.findUnique({
      where: { transporterId: transporterId }
    });

    if (!transporter) {
      return res.status(404).json({ error: "Transporter not found" });
    }


    const newOrder = await prisma.order.create({
      data: {
        orderId: Date.now().toString(),
        invoiceKey: invoicefile.invoiceKey,
        biltyKey: null,
        biltyNumber: null,
        fromAddress: structuredData.supplier_details.address,
        toAddress: structuredData?.customer_details?.toAddress, 
        transporterId: transporterId,
        deliveryType: null,
        statusId: null,
        weight: null,
        customerId: consignor.customerId, 
        payMode: null
      }
    });

    return res.status(201).json({
      message: "Consignor/Consignee verified and order created",
      orderId: newOrder.orderId,
      consignorId: consignor.customerId,
      consigneeId: consignee.customerId
    });

  } catch (error) {
    console.error("Error in createConsignorConsignee:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const createOrderItemDetails = async (req, res) => {
  try {
    const { orderId, transporterId, customerId, order_details } = req.body;

    if (!orderId || !transporterId || !customerId || !Array.isArray(order_details)) {
      return res.status(400).json({ error: "Missing required fields or invalid order_details" });
    }

    // Step 1: Check if the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const createdItems = [];
    let totalWeight = 0;

    for (const item of order_details) {
      const {
        item: itemName,
        quantity,
        price,
        weight,
        packegingType,
        hammali
      } = item;

      const parsedPrice = parseFloat((price || "0").replace(/,/g, ""));
      const parsedWeight = parseFloat(weight || 0);
      const parsedHammali = parseFloat(hammali || 0);

      // ✅ Create item with orderId
      const newItem = await prisma.itemDetails.create({
        data: {
          orderId, // ✅ link to order
          transporterId,
          customerID: parseInt(customerId),
          locationId: "",
          branchName: "",
          stationName: "",
          itemName: itemName || "UNKNOWN",
          per: packegingType || "Box",
          rate: parsedPrice,
          size: quantity,
          hammali: parsedHammali,
          biltyCharge: 0,
          doorDeliveryCharge: 0
        }
      });

      createdItems.push(newItem);
      totalWeight += parsedWeight;
    }

    // ✅ Update total weight in the order
    await prisma.order.update({
      where: { orderId },
      data: {
        weight: totalWeight
      }
    });

    // ✅ Fetch full order with related items
    const orderWithItems = await prisma.order.findUnique({
      where: { orderId },
      include: {
        items: true
      }
    });

    return res.status(200).json({
      message: "Item details created and order updated successfully",
      order: orderWithItems
    });

  } catch (error) {
    console.error("Error in addItemDetailsAndUpdateOrder:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};


export const createOrderPaymentDetails = async (req, res) => {
  try {
    const { orderId, deliveryType, payMode } = req.body;

    if (!orderId || !deliveryType || !payMode) {
      return res.status(400).json({
        error: "Missing required fields: orderId, deliveryType, or payMode"
      });
    }


    const existingOrder = await prisma.order.findUnique({
      where: { orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }


    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        deliveryType,
        payMode
      }
    });


    const updatedOrderWithItems = await prisma.order.findUnique({
      where: { orderId },
      include: {
        items: true 
      }
    });

    return res.status(200).json({
      message: "Order updated successfully with deliveryType and payMode",
      updatedOrder:updatedOrder,
      order: updatedOrderWithItems
    });

  } catch (error) {
    console.error("Error in createOrderPaymentDetails:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};


export const createOrderGenerateBilty = async (req, res) => {
  try {
  
    const fileName = 'bilty.pdf'; 
    const filePath = path.join(process.cwd(), './uploads', fileName); 

    return res.status(200).sendFile(filePath)
  } catch (error) {
    console.error('Error sending PDF:', error);
    return res.status(500).json({ message: 'Failed to send PDF file', error: error.message });
  }
};








export const getOrderDetails = (req,res)=>{
  // get order details for order table and other related tables
}

export const getSignedInvoiceUrl = async (req, res) => {
  const { orderId } = req.body;
  console.log("orderId.....", orderId);

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order || !order.invoiceKey) {
      return res.status(404).json({ error: "Order or invoice not found" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: order.invoiceKey,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    res.status(200).json({ signedUrl });
  } catch (err) {
    console.error("Signed URL error:", err);
    res.status(500).json({ error: "Could not generate signed URL" });
  }
};



