const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Optional Cloudinary Setup
let cloudinary;
let upload;
try {
  cloudinary = require('cloudinary').v2;
  const multer = require('multer');
  const storage = multer.memoryStorage();
  upload = multer({ storage });
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} catch (e) {
  console.warn("Cloudinary or Multer not installed. Image upload disabled.");
  upload = { single: () => (req, res, next) => next() }; // Mock middleware
}

function getEmailFromSession(req) {
  const token = req.cookies.wishy_session;
  if (!token) return null;
  try {
    const email = Buffer.from(token, "base64").toString("utf8");
    return email;
  } catch (e) {
    return null;
  }
}

router.get("/list", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ ok: false });
  const active = (user.wishlists || []).filter((w) => !w.deletedAt);
  return res.json({ ok: true, wishlists: active });
});

router.post("/create", upload.single('image'), async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  
  // Handle FormData or JSON
  const { name, currency, plan, goal, importance } = req.body;
  
  if (!name || !currency || !goal) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }

  let imageUrl = req.body.imageUrl || "";

  // Handle Cloudinary Upload if file exists
  if (req.file && cloudinary) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "wishy/wishlists",
      });
      imageUrl = result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      // Continue without image or return error? Let's continue.
    }
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  
  const finalPlan = plan || user.defaultPlan || "daily";
  const wishlist = {
    name: String(name).trim(),
    currency,
    plan: finalPlan,
    goal: Number(goal),
    importance: importance || "medium",
    imageUrl: imageUrl,
    currentSaved: 0,
    isCompleted: false,
  };
  
  user.wishlists.push(wishlist);
  if (!user.defaultPlan) {
    user.defaultPlan = finalPlan;
  }
  await user.save();
  return res.json({ ok: true, wishlist: user.wishlists[user.wishlists.length - 1] });
});

router.post("/payment", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { wishlistId, amount } = req.body;
  if (!wishlistId || !amount) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(wishlistId);
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  w.currentSaved = Number(w.currentSaved || 0) + Number(amount);
  if (w.currentSaved >= w.goal && !w.isCompleted) {
    w.isCompleted = true;
    w.completedAt = new Date();
  }
  await user.save();
  return res.json({ ok: true, wishlist: w });
});

router.delete("/:id", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const id = req.params.id;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(id);
  if (!w) return res.status(404).json({ ok: false });
  w.deletedAt = new Date();
  await user.save();
  const active = (user.wishlists || []).filter((x) => !x.deletedAt);
  if (active.length === 0) {
    user.defaultPlan = undefined;
    await user.save();
  }
  return res.json({ ok: true });
});

module.exports = router;
