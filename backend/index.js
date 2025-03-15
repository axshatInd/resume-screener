const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const uploadRoutes = require("./routes/upload");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resumes", uploadRoutes); // To fetch uploaded resumes

// Protected Route
app.get("/api/auth/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed!", user: req.user });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
