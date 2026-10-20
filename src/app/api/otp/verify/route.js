import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    const record = await db.collection("otps").findOne({ email });

    // OTP not found
    if (!record) {
      return NextResponse.json(
        { success: false, message: "OTP not found. Please request a new one." },
        { status: 404 }
      );
    }

    // OTP expired
    if (new Date() > new Date(record.expiresAt)) {
      await db.collection("otps").deleteMany({ email });

      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // OTP wrong
    if (record.otp !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP correct — delete it so it can't be reused
    await db.collection("otps").deleteMany({ email });

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("OTP VERIFY ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}