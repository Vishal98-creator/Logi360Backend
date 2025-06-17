// logger.js
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

// Create logs directory if it doesn't exist
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create rotating write stream: daily logs, keep for 10 days
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',          // rotate daily
  path: logDirectory,
  maxFiles: 10             // keep logs for 10 days
});

// Define standard log format (IP, method, URL, status, response time)
const logFormat = ':remote-addr - :method :url :status :res[content-length] - :response-time ms :date[iso]';

const loggerMiddleware = {
  fileLogger: morgan(logFormat, { stream: accessLogStream }),
  consoleLogger: morgan('dev') // optional: for real-time logs in console
};

module.exports = loggerMiddleware;
