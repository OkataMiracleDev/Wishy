const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

router.post("/create", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { name, currency, plan, goal, importance, imageUrl } = req.body;
  if (!name || !currency || !goal) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
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
    imageUrl: imageUrl || "",
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
