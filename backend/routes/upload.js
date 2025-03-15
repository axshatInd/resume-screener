import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

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

// Upload Resume API
router.post("/", upload.single("resume"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.json({ message: "Upload successful", file: req.file.filename });
});

// Get Uploaded Resumes API
router.get("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Unable to read files" });

    const resumes = files.map((file, index) => ({
      id: index + 1,
      name: file,
      status: "Processing", // Default status, later update based on parsing
    }));
    res.json(resumes);
  });
});

export default router;
