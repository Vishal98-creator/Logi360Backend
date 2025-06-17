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

//LoadTruck
// LoadTruck route --- when booking officer click on book truck ------> we have to query on order table on the basic of transporter ID and arrang
// all the data according to the locations ex- indore - (all order data(object) related to indore) and so onn........
// (when user click on book Truck click. i have to return the location and the total weight on that location + additional details)

//getBuilty details -(now when user click on a perticular location) user will send location id , i have to query using loaction id in order table and get the builty details  from builty table and there related item details from item table (no need to query item table becouse item is stored in order table [{}])

///assignTruck -----  they will provide me builtyids and weight. now i have to quert truck details table and send truck data and there driver data

//asignDriver -------- now they will send me driver details or driverID and orderID , i have to update the related order assigntruck id field (add truck id here) ----- in response send  fromAddress, toaddress, truck details, total builty ammount delivery charges


//generateChallan ------gov api (when i update the ordertable assingmentID field, call an api called challan generation orm government api) adn store data in challan table 

//generateChallan -------- genrate challan file , consolidated api form government api and send the files


//

