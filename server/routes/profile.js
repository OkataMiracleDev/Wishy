const express = require("express");
const crypto = require("crypto");
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

router.get("/me", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ ok: false });
  return res.json({
    ok: true,
    user: {
      email: user.email,
      fullname: user.fullname,
      nickname: user.nickname,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
      bankName: user.bankName,
      thankYouMessage: user.thankYouMessage,
      shareToken: user.shareToken || null,
      wishlists: (user.wishlists || []).filter((w) => !w.deletedAt),
    },
  });
});

router.post("/update", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { accountNumber, accountName, bankName, thankYouMessage } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  if (accountNumber !== undefined) user.accountNumber = String(accountNumber);
  if (accountName !== undefined) user.accountName = String(accountName);
  if (bankName !== undefined) user.bankName = String(bankName);
  if (thankYouMessage !== undefined) user.thankYouMessage = String(thankYouMessage);
  await user.save();
  return res.json({ ok: true });
});

router.post("/share", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  if (!user.shareToken) {
    user.shareToken = crypto.randomBytes(10).toString("hex");
    await user.save();
  }
  const headerOrigin = req.get("origin");
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL;
  const appUrl = envAppUrl || headerOrigin || "http://localhost:3000";
  const shareUrl = `${appUrl.replace(/\/+$/, "")}/u/${user.shareToken}`;
  return res.json({ ok: true, shareUrl, token: user.shareToken });
});

module.exports = router;
