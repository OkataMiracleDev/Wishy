const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/profile/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ shareToken: token }).lean();
  if (!user) return res.status(404).json({ ok: false });
  const wishlists = (user.wishlists || []).filter((w) => !w.deletedAt);
  const totalBudget = wishlists.reduce((sum, w) => sum + (w.goal || 0), 0);
  return res.json({
    ok: true,
    profile: {
      fullname: user.fullname,
      nickname: user.nickname,
      email: user.email,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
      bankName: user.bankName,
      thankYouMessage: user.thankYouMessage,
      wishlists,
      totalBudget,
    },
  });
});

router.post("/contribute", async (req, res) => {
  const { token, wishlistId, itemId, amount, name, email, imageData } = req.body;
  if (!token || !wishlistId || !amount || !name || !email || !imageData) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }
  const user = await User.findOne({ shareToken: token });
  if (!user) return res.status(404).json({ ok: false });
  const w = user.wishlists.id(wishlistId);
  if (!w || w.deletedAt) return res.status(404).json({ ok: false });
  user.donations.push({ imageData });
  user.payments.push({
    wishlistId: w._id,
    itemId: itemId || undefined,
    amount: Number(amount),
    name: String(name),
    email: String(email),
    imageUrl: String(imageData),
    source: "external",
  });
  w.currentSaved = Number(w.currentSaved || 0) + Number(amount);
  await user.save();
  return res.json({ ok: true, message: user.thankYouMessage || "Thank you!" });
});

router.get("/payments/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ shareToken: token }).lean();
  if (!user) return res.status(404).json({ ok: false });
  return res.json({ ok: true, payments: user.payments || [] });
});

module.exports = router;
