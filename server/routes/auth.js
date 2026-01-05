const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullname, nickname, phoneNumber, countryCode } = req.body;

    if (!email || !password || !fullname) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: "user_exists" });
    }

    // Check nickname uniqueness if provided
    if (nickname) {
      const existingNick = await User.findOne({ nickname });
      if (existingNick) {
        return res.status(400).json({ ok: false, error: "nickname_taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullname,
      nickname,
      phoneNumber,
      countryCode,
    });

    const token = Buffer.from(`${newUser.email}`).toString("base64");
    res.cookie("wishy_session", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    return res.json({ ok: true, email: newUser.email });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// Signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ ok: false, error: "invalid_credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: "invalid_credentials" });
    }

    const token = Buffer.from(`${user.email}`).toString("base64");
    res.cookie("wishy_session", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    return res.json({ ok: true, email: user.email });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// Check Nickname
const RESERVED = new Set([
  "admin", "root", "system", "support", "help", "wishy", "test", "guest"
]);

router.post("/check-nickname", async (req, res) => {
  try {
    const { nickname } = req.body;
    const nickStr = String(nickname ?? "").trim();
    const valid = /^[A-Za-z0-9_]+$/.test(nickStr);

    if (!nickStr || !valid) {
      return res.status(400).json({ available: false, reason: "invalid" });
    }

    if (RESERVED.has(nickStr.toLowerCase())) {
      return res.json({ available: false });
    }

    const existingUser = await User.findOne({ nickname: nickStr });
    if (existingUser) {
      return res.json({ available: false });
    }

    return res.json({ available: true });
  } catch (error) {
    console.error("Check nickname error:", error);
    return res.status(500).json({ available: false, error: "internal_error" });
  }
});

// Check Email Existence
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ ok: false, error: "missing_email" });
    }
    const user = await User.findOne({ email });
    return res.json({ ok: true, exists: !!user });
  } catch (error) {
    console.error("Check email error:", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// Me (Get Current User)
router.get("/me", (req, res) => {
  const token = req.cookies.wishy_session;
  if (!token) {
    return res.status(401).json({ ok: false });
  }
  try {
    const email = Buffer.from(token, "base64").toString("utf8");
    // In a real app, verify signature or check DB session
    return res.json({ ok: true, email });
  } catch (e) {
    return res.status(401).json({ ok: false });
  }
});

// Signout
router.post("/signout", (req, res) => {
  res.clearCookie("wishy_session");
  return res.json({ ok: true });
});

module.exports = router;
