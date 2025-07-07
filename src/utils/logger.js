import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const rfs = require('rotating-file-stream');

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Define standard log format
const logFormat = ':remote-addr - :method :url :status :res[content-length] - :response-time ms :date[iso]';

export const fileLogger = morgan(logFormat, { stream: accessLogStream });
export const consoleLogger = morgan('dev');
