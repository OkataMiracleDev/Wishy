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

router.post("/donate", async (req, res) => {
  const { token, imageData } = req.body;
  if (!token || !imageData) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }
  const user = await User.findOne({ shareToken: token });
  if (!user) return res.status(404).json({ ok: false });
  user.donations.push({ imageData });
  await user.save();
  return res.json({ ok: true, message: user.thankYouMessage || "Thank you!" });
});

module.exports = router;

