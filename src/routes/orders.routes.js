import express from 'express';
// import { verifyToken } from '../middleware/veriftToken.js';
// import authenticate from '../middleware/authMiddleWare.js'; 
import authenticate from '../middleware/authMiddleWare.js';

import {
    uploadInvoiceGetData,
  uploadeInvoiceDemoData,
  uploadAdditionalDocs,
  createOrderConsignorConsignee,
  createOrderItemDetails,
  createOrderPaymentDetails,
  createOrderGenerateBilty,
  getSignedInvoiceUrl,
  getOrderDetails,
} from '../controllers/order.controller.js';

const orderRouter = express.Router();

orderRouter.use(authenticate);
orderRouter.post('/uploade-invoice', uploadInvoiceGetData);
orderRouter.post('/uploade-invoice-demo', uploadeInvoiceDemoData);
orderRouter.post('/uploade-additional-doc', uploadAdditionalDocs);

orderRouter.post('/create-order/consignorConsigneeDetails', createOrderConsignorConsignee);
orderRouter.post('/create-order/itemDetails', createOrderItemDetails);
orderRouter.post('/create-order/paymentDetails', createOrderPaymentDetails);
orderRouter.post('/create-order/generateBilty', createOrderGenerateBilty);

orderRouter.post('/get-invoice', getSignedInvoiceUrl);
orderRouter.post('/getorderDetails', getOrderDetails);

export default orderRouter;
