const express = require("express");
const { verifyToken } = require("../middleware/veriftToken");
const { uploadInvoiceAndCreateOrder, getSignedInvoiceUrl, orderDetails } = require("../controllers/order.controller");


const orderRouter = express.Router(); // ✅ FIXED LINE

orderRouter.post("/uploade-invoice", uploadInvoiceAndCreateOrder);
orderRouter.post("/uploade-additional-doc", orderDetails); //integrate this new order 4 figma can uploade multipal files 
//get apis
orderRouter.post("/get-invoice", getSignedInvoiceUrl); 
orderRouter.post("/getorderDetails", orderDetails);// get order details
//create order
orderRouter.post("/orderDetails", orderDetails); //add screen first data in the order details table  
orderRouter.post("/orderIteamDetails", orderDetails); //add order item details in the order and item and payment table(for paymoad)
orderRouter.post("/payment/payForOrder", orderDetails);//pay for the order(when user pay create paymentId in order table and update payment table )
orderRouter.post("/cancle-draft-order", orderDetails); // add ststus type to calcle (in ordertable )now user can not se this order
orderRouter.post("/save-order-draft", orderDetails);// add status to draft

orderRouter.post("/generateBuilty", orderDetails);// (transporter table me logo ki details rhegi)


module.exports = orderRouter;
