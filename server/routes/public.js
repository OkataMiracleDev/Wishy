const express = require("express");
const router = express.Router();
const User = require("../models/User");

const rateStore = new Map();
function checkRateLimit(key, windowMs = 60000, max = 30, minGapMs = 3000) {
  const now = Date.now();
  const rec = rateStore.get(key) || { count: 0, windowStart: now, lastAt: 0 };
  if (now - rec.lastAt < minGapMs) {
    return { allowed: false, reason: "min_gap" };
  }
  if (now - rec.windowStart > windowMs) {
    rec.windowStart = now;
    rec.count = 0;
  }
  rec.count += 1;
  rec.lastAt = now;
  rateStore.set(key, rec);
  if (rec.count > max) {
    return { allowed: false, reason: "window_exceeded" };
  }
  return { allowed: true };
}

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
  const rateKey = `contrib:${token}:${req.ip || "ip"}`;
  const rate = checkRateLimit(rateKey, 60000, 30, 3000);
  if (!rate.allowed) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
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

// Wallet: initiate a deposit via Flutterwave (or stub if not configured)
router.post("/wallet/initiate", async (req, res) => {
  const { token, amount, name, email, wishlistId, itemId } = req.body;
  if (!token || !amount || Number(amount) <= 0) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }
  const rateKey = `wallet_init:${token}:${req.ip || "ip"}`;
  const rate = checkRateLimit(rateKey, 60000, 20, 3000);
  if (!rate.allowed) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }
  const user = await User.findOne({ shareToken: token });
  if (!user) return res.status(404).json({ ok: false });
  const wl = wishlistId ? user.wishlists.id(wishlistId) : null;
  const currency = wl?.currency || "NGN";
  const reference = `FLW-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  user.walletTransactions.push({
    type: "deposit",
    amount: Number(amount),
    reference,
    status: "pending",
    meta: { name, email, wishlistId, itemId, currency },
  });
  await user.save();
  const flwSecret = process.env.FLW_SECRET_KEY;
  const flwBase = "https://api.flutterwave.com/v3";
  let payUrl = "";
  if (flwSecret) {
    try {
      const fetch = require("node-fetch");
      const resp = await fetch(`${flwBase}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${flwSecret}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          tx_ref: reference,
          redirect_url: (process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL || "http://localhost:3000") + "/budget",
          customer: { email: email || user.email, name: name || user.fullname },
        }),
      });
      const data = await resp.json().catch(() => ({}));
      payUrl = data?.data?.link || "";
    } catch (e) {
      console.error("Flutterwave initiation failed:", e);
    }
  }
  if (!payUrl) {
    payUrl = "https://flutterwave.com/pay";
  }
  return res.json({ ok: true, reference, payUrl });
});

// Wallet: webhook to confirm deposits (verify signature)
router.post("/wallet/webhook", async (req, res) => {
  try {
    const signature = req.headers["verif-hash"];
    const webhookSecret = process.env.FLW_WEBHOOK_SECRET;
    if (webhookSecret && signature !== webhookSecret) {
      return res.status(401).json({ ok: false });
    }
    const event = req.body;
    const status = event?.data?.status || event?.status;
    const txRef = event?.data?.tx_ref || event?.tx_ref;
    const amount = Number(event?.data?.amount || event?.amount || 0);
    if (!txRef || !amount) {
      return res.status(400).json({ ok: false });
    }
    if (status && String(status).toLowerCase() !== "successful") {
      return res.status(400).json({ ok: false, error: "not_successful" });
    }
    const user = await User.findOne({ "walletTransactions.reference": txRef });
    if (!user) return res.status(404).json({ ok: false });
    const tx = (user.walletTransactions || []).find((t) => t.reference === txRef);
    if (!tx) return res.status(404).json({ ok: false });
    if (tx.status === "completed") {
      return res.json({ ok: true });
    }
    tx.status = "completed";
    tx.meta = { ...(tx.meta || {}), webhook: event };
    user.walletBalance = Number(user.walletBalance || 0) + Number(tx.amount || 0);
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    console.error("Wallet webhook error:", e);
    return res.status(500).json({ ok: false });
  }
});

router.get("/payments/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ shareToken: token }).lean();
  if (!user) return res.status(404).json({ ok: false });
  return res.json({ ok: true, payments: user.payments || [] });
});

module.exports = router;
