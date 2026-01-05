require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
// Allow requests from the frontend (e.g., localhost:3000)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true // Important for cookies
}));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/otp", require("./routes/otp"));

app.get("/", (req, res) => {
  res.send("Wishy API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
