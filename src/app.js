import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

import './utils/prisma.js'; 
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';


import auth from './routes/auth.js';
import { fileLogger, consoleLogger } from './utils/logger.js';
// import masterRoute from './routes/transporter.routes.js';
// import orderRoutes from './routes/orders.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));
app.use(fileLogger);
app.use(consoleLogger);

app.get('/health-check', (req, res) => {
  res.send('Health check successful');
});

// app.use('/api/master-data', masterRoute);
// app.use('/api/orders', orderRoutes);
app.use('/api/auth',auth);

export default app;
