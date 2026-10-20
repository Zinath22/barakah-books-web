// import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";

// // ✅ SAVE ORDER
// export async function POST(req) {

//     const body = await req.json();

//     console.log("ORDER BODY:", body);

//   try {
//     const body = await req.json();

//     const {
//       userEmail,
//       products,
//       total,
//       payment,
//       status,
//     } = body;

//     // Validation
//     if (!userEmail || !products || products.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid order data",
//         },
//         { status: 400 }
//       );
//     }

//     const db = await dbConnect();

//     const result = await db.collection("orders").insertOne({
//       userEmail,
//       products,
//       total,
//       payment: payment || "Paid",
//       status: status || "Pending",
//       createdAt: new Date(),
//     });

//     console.log("INSERT RESULT:", result);

//     return NextResponse.json({
//       success: true,
//       message: "Order saved successfully",
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.log("ORDER SAVE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to save order",
//       },
//       { status: 500 }
//     );
//   }
// }

// // ✅ GET ALL ORDERS (Admin)
// export async function GET() {
//   try {
//     const db = await dbConnect();

//     const orders = await db
//       .collection("orders")
//       .find({})
//       .sort({ createdAt: -1 })
//       .toArray();

//     return NextResponse.json(orders);
//   } catch (error) {
//     console.log("GET ORDER ERROR:", error);

//     return NextResponse.json(
//       [],
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

// =========================
// SAVE ORDER
// =========================
export async function POST(req) {
  try {
    const body = await req.json();

    console.log("ORDER BODY:", body);

    const {
      userEmail,
      products,
      total,
      payment,
      status,
    } = body;

    // Validation
    if (
      !userEmail ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    console.log("DB CONNECTED");

    const result = await db.collection("orders").insertOne({
      userEmail,
      products,
      total: Number(total),
      payment: payment || "Paid",
      status: status || "Pending",
      createdAt: new Date(),
    });

    
    // বিক্রির সংখ্যা বাড়ানো আর স্টক কমানো (বেস্টসেলার তালিকার জন্য)
    try {
      const { ObjectId } = await import("mongodb");
      for (const item of products) {
        if (!item?._id || !ObjectId.isValid(item._id)) continue;
        const qty = Number(item.qty) || 1;
        await db.collection("products").updateOne({ _id: new ObjectId(item._id) }, { $inc: { sold: qty } });
        await db.collection("products").updateOne(
          { _id: new ObjectId(item._id), stock: { $gte: qty } },
          { $inc: { stock: -qty } }
        );
      }
    } catch (e) {
      console.log("SOLD COUNT ERROR:", e.message);
    }
    console.log("INSERT RESULT:", result);

    return NextResponse.json({
      success: true,
      message: "Order saved successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.log("ORDER SAVE ERROR:", error);

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
// GET ALL ORDERS
// =========================
export async function GET() {
  try {
    const db = await dbConnect();

    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.log("GET ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}