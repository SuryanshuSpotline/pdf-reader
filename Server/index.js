const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const extractFontsFromPDF = require("./extractFonts.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.json({ message: "V-Assure PDF Reader API is running!" });
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  console.log("Incoming /upload request");

  if (!req.file) {
    console.warn("No file uploaded in the request");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(uploadDir, req.file.filename);
  const fileUrl = `/uploads/${req.file.filename}`;
  console.log(`Received file: ${req.file.originalname}`);

  try {
    const fonts = await extractFontsFromPDF(filePath);
    const fontResponse = fonts.length > 0 ? fonts : ["none"];

    res.json({
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: fontResponse,
    });
  } catch (error) {
    console.error("❌ Error during font extraction:", error.message);

    res.status(500).json({
      error: "Failed to extract fonts from PDF",
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: ["none"],
    });
  } finally {
    // fs.unlinkSync(filePath);
  }
});

app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});