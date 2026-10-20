import crypto from "node:crypto";
import { Resend } from "resend";
import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MAX_ATTEMPTS = 5;

// POST /api/otp/send  body: { email }
export async function sendOtp(req, res) {
  const email = (req.body?.email || "").toLowerCase().trim();
  if (!email) throw new ApiError(400, "Email is required");
  if (!resend) throw new ApiError(500, "Email service is not configured");

  // 60 second er moddhe abar pathano jabe na
  const last = await col("otps").findOne({ email });
  if (last && Date.now() - new Date(last.createdAt).getTime() < 60_000)
    throw new ApiError(429, "Please wait a minute before requesting a new OTP");

  const otp = crypto.randomInt(1000, 10000).toString();
  await col("otps").deleteMany({ email });
  await col("otps").insertOne({
    email,
    otpHash: crypto.createHash("sha256").update(otp).digest("hex"),
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    createdAt: new Date(),
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Barakah Books <onboarding@resend.dev>",
    to: email,
    subject: "বারাকাহ বুকস — আপনার লগইন OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#0f5c45;text-align:center">🔐 Your Login OTP</h2>
        <p style="color:#666;text-align:center">Use this code to complete your login to Barakah Books</p>
        <div style="background:#f7f1e1;border:2px dashed #0f5c45;border-radius:12px;padding:24px;text-align:center">
          <p style="font-size:48px;font-weight:bold;color:#0f5c45;letter-spacing:16px;margin:0">${otp}</p>
        </div>
        <p style="color:#999;text-align:center;font-size:13px">⏱️ This code will expire in <strong>5 minutes</strong></p>
      </div>`,
  });

  res.json({ success: true, message: "OTP sent to your email" });
}

// POST /api/otp/verify  body: { email, otp }
export async function verifyOtp(req, res) {
  const email = (req.body?.email || "").toLowerCase().trim();
  const otp = (req.body?.otp || "").toString().trim();
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const record = await col("otps").findOne({ email });
  if (!record) throw new ApiError(400, "OTP not found. Please request a new one.");

  if (new Date() > new Date(record.expiresAt) || record.attempts >= MAX_ATTEMPTS) {
    await col("otps").deleteMany({ email });
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  const hash = crypto.createHash("sha256").update(otp).digest("hex");
  if (hash !== record.otpHash) {
    await col("otps").updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  await col("otps").deleteMany({ email });
  res.json({ success: true, message: "OTP verified successfully" });
}
