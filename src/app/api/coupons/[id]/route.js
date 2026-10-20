import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// =========================
// UPDATE COUPON (Admin)
// =========================
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    // Build update object from whatever fields are sent
    const updateFields = {};

    if (body.code !== undefined)
      updateFields.code = body.code.toUpperCase().trim();

    if (body.discountType !== undefined)
      updateFields.discountType = body.discountType;

    if (body.discountValue !== undefined)
      updateFields.discountValue = Number(body.discountValue);

    if (body.minOrderAmount !== undefined)
      updateFields.minOrderAmount = Number(body.minOrderAmount);

    if (body.maxDiscount !== undefined)
      updateFields.maxDiscount = Number(body.maxDiscount);

    if (body.expiryDate !== undefined)
      updateFields.expiryDate = new Date(body.expiryDate);

    if (body.usageLimit !== undefined)
      updateFields.usageLimit = Number(body.usageLimit);

    if (body.isActive !== undefined)
      updateFields.isActive = body.isActive;

    // If code is being changed, check for duplicates
    if (updateFields.code) {
      const existing = await db.collection("coupons").findOne({
        code: updateFields.code,
        _id: { $ne: new ObjectId(id) },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: "Coupon code already exists",
          },
          { status: 409 }
        );
      }
    }

    const result = await db.collection("coupons").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.log("UPDATE COUPON ERROR:", error);

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
// DELETE COUPON (Admin)
// =========================
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    const result = await db
      .collection("coupons")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.log("DELETE COUPON ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}