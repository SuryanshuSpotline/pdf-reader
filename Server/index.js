const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const extractFontsFromPDF = require("./extractFonts.js");  // Use require instead of import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

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

app.get("/", (req, res) => {
  res.json({ message: "V-Assure PDF Reader API is running!" });
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    console.log("Received request to /upload");
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const filePath = path.join(uploadDir, req.file.filename);
  
  try {
    // Extract fonts from the uploaded PDF
    const fonts = await extractFontsFromPDF(filePath);

    // If fonts are not found, set it to 'none'
    const fontResponse = fonts.length > 0 ? fonts : ['none'];

    // Send the fonts data in the response
    res.json({
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: fontResponse,  // Send the extracted fonts or 'none'
    });
  } catch (error) {
    console.error("Error extracting fonts:", error);
    res.status(500).json({
      error: "Failed to extract fonts from PDF",
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: ['none'],  // If extraction fails, return 'none'
    });
  }
});

app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});