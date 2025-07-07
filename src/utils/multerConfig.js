
import multer from 'multer';

const storage = multer.memoryStorage(); // Required for XLSX.read(file.buffer)
const upload = multer({ storage });

export default upload;
