require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
// Enable trust proxy for cookies behind load balancers (Render/Heroku/etc)
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
// Allow requests from the frontend (e.g., localhost:3000)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://wishy-app.vercel.app",
    "https://wishy-backend-ibt4.onrender.com"
  ],
  credentials: true // Important for cookies
}));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/otp", require("./routes/otp"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/public", require("./routes/public"));
app.use("/api/ai", require("./routes/ai"));

app.get("/", (req, res) => {
  res.send("Wishy API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
