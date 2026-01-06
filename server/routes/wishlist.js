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
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  
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
  
  if (!name || !currency) {
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
    goal: Number(goal ?? 0),
    importance: importance || "medium",
    imageUrl: imageUrl,
    currentSaved: 0,
    isCompleted: false,
    items: [],
  };
  
  user.wishlists.push(wishlist);
  if (!user.defaultPlan) {
    user.defaultPlan = finalPlan;
  }
  await user.save();
  return res.json({ ok: true, wishlist: user.wishlists[user.wishlists.length - 1] });
});

router.post("/update", upload.single('image'), async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { id, name, currency, plan, importance } = req.body;
  if (!id) return res.status(400).json({ ok: false, error: "invalid_input" });
  let imageUrl = req.body.imageUrl || "";
  if (req.file && cloudinary) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, { folder: "wishy/wishlists" });
      imageUrl = result.secure_url;
    } catch {}
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(id);
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  if (typeof name === "string") w.name = String(name).trim();
  if (typeof currency === "string") w.currency = currency;
  if (typeof plan === "string") w.plan = plan;
  if (typeof importance === "string") w.importance = importance;
  if (imageUrl) w.imageUrl = imageUrl;
  await user.save();
  return res.json({ ok: true, wishlist: w });
});

router.post("/item/add", upload.single('image'), async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { wishlistId, name, price, importance, description } = req.body;
  if (!wishlistId || !name || !price) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }
  let imageUrl = req.body.imageUrl || "";
  if (req.file && cloudinary) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "wishy/items",
      });
      imageUrl = result.secure_url;
    } catch (err) {}
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(wishlistId);
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  w.items.push({
    name: String(name).trim(),
    price: Number(price),
    importance: importance || "medium",
    imageUrl,
    description: description ? String(description).trim() : "",
  });
  w.goal = (w.items || []).reduce((sum, it) => sum + Number(it.price || 0), 0);
  await user.save();
  return res.json({ ok: true, wishlist: w });
});

router.post("/item/update", upload.single('image'), async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { wishlistId, itemId, name, price, importance, description } = req.body;
  if (!wishlistId || !itemId) return res.status(400).json({ ok: false, error: "invalid_input" });
  let imageUrl = req.body.imageUrl || "";
  if (req.file && cloudinary) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, { folder: "wishy/items" });
      imageUrl = result.secure_url;
    } catch {}
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(wishlistId);
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  const it = (w.items || []).id(itemId);
  if (!it) return res.status(404).json({ ok: false });
  if (typeof name === "string") it.name = String(name).trim();
  if (typeof price !== "undefined") it.price = Number(price);
  if (typeof importance === "string") it.importance = importance;
  if (typeof description === "string") it.description = String(description).trim();
  if (imageUrl) it.imageUrl = imageUrl;
  w.goal = (w.items || []).reduce((sum, x) => sum + Number(x.price || 0), 0);
  await user.save();
  return res.json({ ok: true, wishlist: w });
});

router.delete("/item/:wishlistId/:itemId", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { wishlistId, itemId } = req.params;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(wishlistId);
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  const idx = (w.items || []).findIndex((x) => String(x._id) === String(itemId));
  if (idx === -1) return res.status(404).json({ ok: false });
  w.items.splice(idx, 1);
  w.goal = (w.items || []).reduce((sum, x) => sum + Number(x.price || 0), 0);
  await user.save();
  return res.json({ ok: true, wishlist: w });
});
router.get("/items/:wishlistId", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { wishlistId } = req.params;
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.find((x) => String(x._id) === String(wishlistId));
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  return res.json({ ok: true, items: w.items || [], wishlist: { _id: w._id, name: w.name, currency: w.currency, goal: w.goal, currentSaved: w.currentSaved } });
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
  user.payments.push({
    wishlistId: w._id,
    amount: Number(amount),
    source: "self",
  });
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
