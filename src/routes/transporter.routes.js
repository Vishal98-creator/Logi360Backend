import express from 'express';
import { uploadMasterData } from '../controllers/transport.controller.js';
import upload from '../utils/multerConfig.js'

const router = express.Router();

// const upload = multer({ dest: "uploads/" });

// Post route to handle file upload (now for Excel files)
router.post("/upload-excel", upload.single("file"), uploadMasterData);

export default router;
