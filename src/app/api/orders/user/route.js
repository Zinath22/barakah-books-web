import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    const orders = await db
      .collection("orders")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log("GET USER ORDERS ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}