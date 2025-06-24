
const dotenv = require("dotenv");
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env"
  });
require('./utils/prisma'); 

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { fileLogger, consoleLogger } = require('./utils/logger');

// const masterRoute = require('./routes/transporter.routes');
// const orderRoutes = require('./routes/orders.routes');
const auth = require('./routes/auth');

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

module.exports = app;
