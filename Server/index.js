import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import extractFonts from "./extractFonts.js";  // Import the font extraction function
import dotenv from "dotenv";

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
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const filePath = path.join(uploadDir, req.file.filename);
  
  try {
    // Extract fonts from the uploaded PDF
    const fonts = await extractFonts(filePath);

    // Send the fonts data in the response
    res.json({
      url: fileUrl,
      originalName: req.file.originalname,
      fonts: fonts,  // Send the extracted fonts
    });
  } catch (error) {
    console.error("Error extracting fonts:", error);
    res.status(500).json({ error: "Failed to extract fonts from PDF" });
  }
});

app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});