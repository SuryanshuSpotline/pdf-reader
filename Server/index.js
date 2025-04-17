const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const extractPDFProperties = require("./extractPDFProperties");
const extractPDFPropertiesAPI = require("./extractPDFPropertiesAPI");

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

app.use("/extract", extractPDFPropertiesAPI);

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
    const { fonts, properties } = await extractPDFProperties(filePath);
    const fontResponse = fonts.length > 0 ? fonts : ["none"];

    res.json({
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: fontResponse,
      properties,
    });
  } catch (error) {
    console.error("Error during font extraction or properties fetching:", error.message);

    res.status(500).json({
      error: "Failed to extract fonts or properties from PDF",
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: ["none"],
      properties: null,
    });
  }
});

app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});