const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const extractPDFProperties = require("./extractPDFProperties");

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/extract-fonts-and-properties", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const filePath = path.join(uploadDir, req.file.filename);

  try {
    const { fonts, properties } = await extractPDFProperties(filePath);
    
    const fontResponse = fonts.length > 0 ? fonts : ["none"];

    res.json({
      file: req.file.originalname,
      fonts: fontResponse,
      properties,
    });
  } catch (err) {
    res.status(500).json({
      error: "Font extraction or property fetch failed",
      details: err.message,
    });
  } finally {
    fs.unlinkSync(filePath);
  }
});

module.exports = router;
