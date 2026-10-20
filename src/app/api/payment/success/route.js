import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const body = await req.json();

    const db = await dbConnect();

    await db.collection("orders").insertOne({
      userEmail: body.email,
      products: body.products,
      amount: body.amount,
      paymentStatus: "Paid",
      orderStatus: "Pending",
      transactionId: body.tran_id,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}