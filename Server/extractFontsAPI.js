const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const extractFontsFromPDF = require("./extractFonts");

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

router.post("/extract-fonts", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const filePath = path.join(uploadDir, req.file.filename);

  try {
    const fonts = await extractFontsFromPDF(filePath);
    const fontResponse = fonts.length > 0 ? fonts : ["none"];
    res.json({
      file: req.file.originalname,
      fonts: fontResponse,
    });
  } catch (err) {
    res.status(500).json({
      error: "Font extraction failed",
      details: err.message,
    });
  } finally {
    // Optional: delete uploaded file after processing
    fs.unlinkSync(filePath);
  }
});

module.exports = router;