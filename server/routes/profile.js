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
    user.shareToken = crypto.randomBytes(5).toString("hex");
    await user.save();
  }
  const headerOrigin = req.get("origin");
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL;
  const appUrl = envAppUrl || headerOrigin || "http://localhost:3000";
  const rawName = user.nickname || user.fullname || "user";
  const username = String(rawName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const shareUrl = `${appUrl.replace(/\/+$/, "")}/${username}/${user.shareToken}`;
  return res.json({ ok: true, shareUrl, token: user.shareToken });
});

router.get("/payments", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ ok: false });
  return res.json({ ok: true, payments: user.payments || [] });
});

// Clear payments history (does not affect balances)
router.post("/payments/clear", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  user.payments = [];
  await user.save();
  return res.json({ ok: true });
});

// Wallet balance and transactions
router.get("/wallet", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ ok: false });
  return res.json({ ok: true, balance: Number(user.walletBalance || 0), transactions: user.walletTransactions || [] });
});

// Wallet withdraw
router.post("/wallet/withdraw", async (req, res) => {
  const email = getEmailFromSession(req);
  if (!email) return res.status(401).json({ ok: false });
  const { amount, idempotencyKey } = req.body;
  const amt = Number(amount || 0);
  if (!amt || amt <= 0) return res.status(400).json({ ok: false, error: "invalid_amount" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ok: false });
  if (!user.accountNumber || !user.bankName || !user.accountName) {
    return res.status(400).json({ ok: false, error: "missing_account" });
  }
  // check idempotency
  if (idempotencyKey && (user.walletTransactions || []).find((t) => t.reference === String(idempotencyKey))) {
    return res.json({ ok: true }); // already processed
  }
  const withdrawFeePercent = 1;
  const fee = amt * (withdrawFeePercent / 100);
  const totalDebit = amt + fee;
  if (Number(user.walletBalance || 0) < totalDebit) {
    return res.status(400).json({ ok: false, error: "insufficient_funds" });
  }
  user.walletBalance = Number(user.walletBalance || 0) - totalDebit;
  user.walletTransactions.push({
    type: "withdraw",
    amount: amt,
    reference: idempotencyKey || `WD-${Date.now()}`,
    status: "completed",
    meta: { 
      to: { accountNumber: user.accountNumber, bankName: user.bankName, accountName: user.accountName },
      fee,
      feePercent: withdrawFeePercent,
      netPayout: amt
    },
  });
  await user.save();
  return res.json({ ok: true, balance: user.walletBalance });
});

module.exports = router;
