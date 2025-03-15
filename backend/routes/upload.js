import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import natural from "natural";
import Resume from "../models/Resume.js"; // Import Resume model

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

// Sample job description skills (these can be dynamically fetched)
const jobSkills = ["JavaScript", "React", "Node.js", "MongoDB", "AWS"];

// Function to extract keywords from resume text
const extractKeywords = (text) => {
  const tokenizer = new natural.WordTokenizer();
  return tokenizer.tokenize(text).map((word) => word.toLowerCase());
};

// Compare extracted skills with job requirements
const matchSkills = (extractedText) => {
  const resumeKeywords = extractKeywords(extractedText);
  return jobSkills.filter((skill) =>
    resumeKeywords.includes(skill.toLowerCase())
  );
};

// Ranking function (based on match count)
const calculateRanking = (matchedSkills) => {
  return (matchedSkills.length / jobSkills.length) * 100; // Percentage match
};

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

// Upload Resume API with MongoDB Storage
router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.join(uploadDir, req.file.filename);

  try {
    const extractedText = await extractResumeText(filePath, req.file.mimetype);
    const matchedSkills = matchSkills(extractedText);
    const rankingScore = calculateRanking(matchedSkills);

    // Store in MongoDB
    const resume = new Resume({
      filename: req.file.filename,
      extractedText,
      matchedSkills,
      rankingScore,
    });
    await resume.save();

    res.json({
      message: "Upload successful",
      file: req.file.filename,
      extractedText,
      matchedSkills,
      rankingScore, // Rank based on skill matching
    });
  } catch (error) {
    res.status(500).json({ error: "Error parsing the resume" });
  }
});

// Fetch All Resumes API
router.get("/", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadedAt: -1 }); // Get all resumes
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching resumes" });
  }
});

export default router;
