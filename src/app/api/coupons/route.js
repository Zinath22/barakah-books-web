import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

// =========================
// GET ALL COUPONS (Admin)
// =========================
export async function GET() {
  try {
    const db = await dbConnect();

    const coupons = await db
      .collection("coupons")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.log("GET COUPONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =========================
// CREATE COUPON (Admin)
// =========================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit,
    } = body;

    // Validation
    if (!code || !discountType || !discountValue || !expiryDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (!["percentage", "fixed"].includes(discountType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid discount type",
        },
        { status: 400 }
      );
    }

    if (Number(discountValue) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount value must be greater than 0",
        },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Percentage discount cannot exceed 100%",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    // Prevent duplicate coupon codes
    const existing = await db
      .collection("coupons")
      .findOne({ code: code.toUpperCase().trim() });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 409 }
      );
    }

    const result = await db.collection("coupons").insertOne({
      code:           code.toUpperCase().trim(),
      discountType,
      discountValue:  Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount:    Number(maxDiscount)    || 0,
      expiryDate:     new Date(expiryDate),
      usageLimit:     Number(usageLimit)     || 0,
      usedCount:      0,
      usedBy:         [],
      isActive:       true,
      createdAt:      new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.log("CREATE COUPON ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}