const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Protected Route
app.get("/api/auth/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed!", user: req.user });
});

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});
