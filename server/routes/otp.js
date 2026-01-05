const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Send OTP
router.post("/send", async (req, res) => {
  console.log("[OTP] Received request to send OTP");
  const { email } = req.body;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.log("[OTP] Invalid email:", email);
    return res.status(400).json({ ok: false, error: "invalid_email" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // SMTP Configuration
  const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@wishy.app";
  const senderName = process.env.BREVO_SENDER_NAME || "Wishy";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wishy.app";

  console.log("[OTP] Environment check:", {
    hasSmtpUser: !!smtpUser,
    hasSmtpPass: !!smtpPass,
    smtpHost,
    smtpPort,
    senderEmail,
    codeGenerated: code
  });

  const html = `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7f7fb;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.08);overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:28px 24px;color:#fff">
        <div style="font-size:24px;font-weight:700">Your Wishy verification code</div>
        <div style="opacity:.9;margin-top:6px">Use this code to continue signing up</div>
      </div>
      <div style="padding:28px 24px">
        <div style="font-size:18px;margin-bottom:8px">Enter this code:</div>
        <div style="font-size:32px;letter-spacing:6px;font-weight:800;color:#111;border:2px dashed #e5e7eb;border-radius:12px;padding:16px;text-align:center;background:#fafafa">${code}</div>
        <div style="margin-top:18px;color:#4b5563;font-size:14px">This code expires in 10 minutes.</div>
        <div style="margin-top:24px;color:#111;font-size:14px">
          If you didn’t request this, you can safely ignore this email.
        </div>
      </div>
      <div style="padding:18px 24px;border-top:1px solid #eee;color:#6b7280;font-size:12px">
        <div>Wishy • Delightful wishlists and budgets</div>
        <div style="margin-top:6px"><a href="${appUrl}" style="color:#7c3aed;text-decoration:none">Open Wishy</a></div>
      </div>
    </div>
  </div>`;

  let emailSent = false;
  if (smtpUser && smtpPass) {
    console.log("[OTP] Attempting to send email via SMTP...");
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: "Your Wishy verification code",
        html: html,
      });

      console.log("[OTP] SMTP response:", info.messageId);
      emailSent = true;
    } catch (err) {
      console.error("[OTP] Error sending email via SMTP:", err);
      emailSent = false;
    }
  } else {
    console.warn("[OTP] Missing SMTP credentials. Skipping email send.");
  }

  // Set cookies
  res.cookie("wishy_otp_email", email, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 mins
    sameSite: "lax", // Adjust based on deployment
    // secure: process.env.NODE_ENV === 'production'
  });
  
  res.cookie("wishy_otp_code", code, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    sameSite: "lax",
    // secure: process.env.NODE_ENV === 'production'
  });

  return res.json({ ok: true, email_sent: emailSent, testing: !smtpUser });
});

// Verify OTP
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;
  const emailCookie = req.cookies.wishy_otp_email;
  const codeCookie = req.cookies.wishy_otp_code;

  if (!email || !otp || otp.length !== 6) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  if (emailCookie !== email || codeCookie !== otp) {
    return res.status(400).json({ ok: false, error: "invalid_code" });
  }

  // Clear cookies
  res.clearCookie("wishy_otp_email");
  res.clearCookie("wishy_otp_code");

  return res.json({ ok: true });
});

module.exports = router;
