const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");
const { OpenAI } = require('openai');
const { parse } = require('json2csv');  // For CSV generation
const fs = require('fs');
const path = require('path');

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

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Extract raw text using DetectDocumentText
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

// Enhance the prompt and pass to OpenAI for structured extraction
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
    model: "gpt-4",  // Or use the appropriate model
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

  // Extract the raw response text, which should be in JSON format
  const responseText = completion.choices[0].message.content;

  // Clean up the response if it includes extra narrative
  let structuredData = {};

  try {
    // Try parsing the response as JSON
    structuredData = JSON.parse(responseText);
  } catch (err) {
    console.error("Error parsing OpenAI response as JSON:", err);
    // Handle the case when the response is not valid JSON (fallback or return an error)
    throw new Error("Failed to parse OpenAI response into JSON.");
  }

  return structuredData;
}

// Store temporarily in memory or disk
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('invoice');

// Upload invoice to S3 and create order in DB
exports.uploadInvoiceAndCreateOrder = (req, res) => {
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
      const fileKey = `invoices/${Date.now()}-${file.originalname}`;

      // 1. Upload to S3
      console.time("S3Upload");
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
      });
      await s3.send(command);
      console.timeEnd("S3Upload");

      // 2. Extract raw text using DetectDocumentText
      console.time("Textract");
      const extractedText = await extractRawTextFromImage(file.buffer);
      console.log("Extracted Invoice Text:", extractedText);
      console.timeEnd("Textract");

      // 3. Extract structured data from OpenAI
      console.time("OpenAI");
      const structuredData = await extractStructuredDataFromText(extractedText);
      console.log("Extracted Structured Data:", structuredData);
      console.timeEnd("OpenAI");

      // 4. Create DB entry
      console.time("DBWrite");
      const newOrder = await prisma.order.create({
        data: {
          invoiceKey: fileKey,
          invoiceFileName: file.originalname
        }
      });
      console.timeEnd("DBWrite");

      // 5. Process the `order_details` array for CSV
      const orderDetails = structuredData.customer_details.order_details;

      // Ensure that `order_details` has the correct structure
      if (Array.isArray(orderDetails) && orderDetails.length > 0) {
        // Convert to CSV format
        const csvData = parse(orderDetails);  // Convert order details to CSV format
        const txtData = JSON.stringify(structuredData, null, 2);  // Convert to formatted text for .txt

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
          message: "Invoice uploaded, order created, and text extracted",
          orderId: newOrder.id,
          fileKey: fileKey,
          structuredData: structuredData,
          files: {
            txt: txtData,
            csv: csvData,
            json: JSON.stringify(structuredData)
          }
        });
      } else {
        throw new Error("Order details are empty or not properly structured");
      }

    } catch (err) {
      console.error("Upload or Textract error:", err);
      res.status(500).json({ error: "Upload or Textract failed", details: err.message });
    }
  });
};




//get invoice form S3
exports.getSignedInvoiceUrl = async (req, res) => {
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

exports.orderDetails = async (req, res) => {
  const {
    orderId,
    consignorName,
    consignorGstin,
    fromAddress,
    consignorMobile,
    eWayBillNo,
    eWayBillExp
  } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        consignorName,
        consignorGstin,
        fromAddress,
        consignorMobile,
        eWayBillNo,
        eWayBillExp: eWayBillExp ? new Date(eWayBillExp) : null
      }
    });

    return res.status(200).json({
      message: "Order details updated successfully",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Error updating order details:", err);
    return res.status(500).json({ error: "Could not update order details" });
  }
};

