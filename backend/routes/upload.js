import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Function to extract text from resumes
const extractResumeText = async (filePath, mimetype) => {
  if (mimetype === "application/pdf") {
    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
  } else {
    throw new Error("Unsupported file format");
  }
};

// Upload Resume API
router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.join(uploadDir, req.file.filename);

  try {
    const extractedText = await extractResumeText(filePath, req.file.mimetype);
    res.json({
      message: "Upload successful",
      file: req.file.filename,
      extractedText,
    });
  } catch (error) {
    res.status(500).json({ error: "Error parsing the resume" });
  }
});

// Get Uploaded Resumes API
router.get("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Unable to read files" });

    const resumes = files.map((file, index) => ({
      id: index + 1,
      name: file,
      status: "Processing", // Default status, later update based on AI screening
    }));
    res.json(resumes);
  });
});

export default router;
