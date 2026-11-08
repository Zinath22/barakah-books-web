// import { dbConnect } from "@/lib/dbConnect";
// import { ObjectId } from "mongodb";
// import { NextResponse } from "next/server";

// export async function PATCH(req, { params }) {
//   const db = await dbConnect();

//   await db.collection("orders").updateOne(
//     {
//       _id: new ObjectId(params.id),
//     },
//     {
//       $set: {
//         orderStatus: "Approved",
//       },
//     }
//   );

//   return NextResponse.json({
//     success: true,
//   });
// }

import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { STATUS_VALUES } from "@/lib/orders";

// =========================
// অর্ডার আপডেট (অ্যাডমিন)
// PATCH /api/orders/:id
// body: { status?: "Pending" | "Approved" | "Shipped" | "Delivered" | "Cancelled", payment?: "Paid" | "Unpaid" }
// body খালি পাঠালে আগের মতো শুধু "Approved" হয়
// =========================
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid order ID" }, { status: 400 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const db = await dbConnect();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const status = body.status ?? (body.payment ? undefined : "Approved");
    if (status !== undefined && !STATUS_VALUES.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }
    if (body.payment !== undefined && !["Paid", "Unpaid"].includes(body.payment)) {
      return NextResponse.json({ success: false, message: "Invalid payment" }, { status: 400 });
    }

    const update = { updatedAt: new Date() };
    if (status) {
      update.status = status;
      update.orderStatus = status; // পুরোনো অর্ডারের field এর সাথে মিল রাখা
    }
    if (body.payment) {
      update.payment = body.payment;
      update.paymentStatus = body.payment;
    }
    // অ্যাডমিন Approve করলে (বা বই পৌঁছে গেলে) টাকা পাওয়া গেছে ধরা হয় → Payment "Paid"
    if ((status === "Approved" || status === "Delivered") && !body.payment) {
      update.payment = "Paid";
      update.paymentStatus = "Paid";
    }
    // টাকা পাওয়ার সময় রাখা — বিক্রির হিসাব এই দিনেই যোগ হয়
    const wasPaid = order.payment === "Paid";
    if (update.payment === "Paid" && !wasPaid) update.paidAt = new Date();
    if (update.payment === "Unpaid") update.paidAt = null;

    await db.collection("orders").updateOne({ _id: order._id }, { $set: update });

    return NextResponse.json({ success: true, message: "Order updated", update });
  } catch (error) {
    console.log("UPDATE ORDER ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}