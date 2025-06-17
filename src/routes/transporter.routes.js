const express = require("express");
const multer = require("multer");
const { uploadExcel } = require("../controllers/transport.controller");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Post route to handle file upload (now for Excel files)
router.post("/upload-excel", upload.single("file"), uploadExcel);

module.exports = router;
