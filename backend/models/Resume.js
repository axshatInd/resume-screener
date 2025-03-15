import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    filename: String,
    extractedText: String,
    matchedSkills: [String],
    rankingScore: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", ResumeSchema);

export default Resume;
