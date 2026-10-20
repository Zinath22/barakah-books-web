import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("VALIDATE BODY:", body);

    const { code, orderAmount, userEmail } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    if (!orderAmount || Number(orderAmount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount" },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    const coupon = await db
      .collection("coupons")
      .findOne({ code: code.toUpperCase().trim() });

    console.log("COUPON FOUND:", coupon);

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code" },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json(
        { success: false, message: "This coupon has expired" },
        { status: 400 }
      );
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // if (userEmail && coupon.usedBy && coupon.usedBy.includes(userEmail)) {
    //   return NextResponse.json(
    //     { success: false, message: "You have already used this coupon" },
    //     { status: 400 }
    //   );
    // }

    if (
      coupon.minOrderAmount > 0 &&
      Number(orderAmount) < coupon.minOrderAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order amount is TK ${coupon.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (Number(orderAmount) * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
      if (discountAmount > Number(orderAmount)) {
        discountAmount = Number(orderAmount);
      }
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.round(
      Math.max(0, Number(orderAmount) - discountAmount) * 100
    ) / 100;

    console.log("DISCOUNT:", discountAmount, "FINAL:", finalAmount);

    return NextResponse.json({
      success:       true,
      message:       "Coupon applied successfully",
      coupon: {
        code:          coupon.code,
        discountType:  coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount:   coupon.maxDiscount,
      },
      discountAmount,
      finalAmount,
    });

  } catch (error) {
    console.log("VALIDATE COUPON ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}