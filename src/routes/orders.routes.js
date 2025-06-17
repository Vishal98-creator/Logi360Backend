const express = require("express");
const { verifyToken } = require("../middleware/veriftToken");
const { uploadInvoiceAndCreateOrder, getSignedInvoiceUrl, orderDetails } = require("../controllers/order.controller");


const orderRouter = express.Router(); // ✅ FIXED LINE

orderRouter.post("/uploade-invoice", uploadInvoiceAndCreateOrder);
orderRouter.post("/uploade-additional-doc", orderDetails); //integrate this new order 4 figma can uploade multipal files 
//get apis
orderRouter.post("/get-invoice", getSignedInvoiceUrl); 
orderRouter.post("/getorderDetails", orderDetails);// get order details

