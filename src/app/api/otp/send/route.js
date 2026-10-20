import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Resend } from "resend";

// Resend আসল request এর সময় তৈরি হয়, যাতে key না থাকলে build না ভাঙে
const getResend = () => new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Generate 4-digit OTP
    const otp     = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const db = await dbConnect();

    // Delete any existing OTP for this email
    await db.collection("otps").deleteMany({ email });

    // Save new OTP
    await db.collection("otps").insertOne({
      email,
      otp,
      expiresAt,
      createdAt: new Date(),
    });

    // Send OTP email via Resend
    await getResend().emails.send({
      from:    process.env.RESEND_FROM_EMAIL || "Barakah Books <onboarding@resend.dev>",
      to:      email,
      subject: "বারাকাহ বুকস — আপনার লগইন OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
          <h2 style="color: #0f5c45; text-align: center; margin-bottom: 8px;">
            🔐 Your Login OTP
          </h2>
          <p style="color: #666; text-align: center; margin-bottom: 24px;">
            Use this code to complete your login to Barakah Books
          </p>
          <div style="background: #f7f1e1; border: 2px dashed #0f5c45; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 48px; font-weight: bold; color: #0f5c45; letter-spacing: 16px; margin: 0;">
              ${otp}
            </p>
          </div>
          <p style="color: #999; text-align: center; font-size: 13px;">
            ⏱️ This code will expire in <strong>5 minutes</strong>
          </p>
          <p style="color: #999; text-align: center; font-size: 12px; margin-top: 16px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("OTP SENT:", otp, "to:", email);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log("OTP SEND ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}