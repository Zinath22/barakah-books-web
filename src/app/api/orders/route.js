


// import { NextResponse } from "next/server";
// import { ObjectId } from "mongodb";
// import { dbConnect } from "@/lib/dbConnect";
// import { normalizePhone, shippingError } from "@/lib/orders";

// // =========================
// // ✅ অর্ডার সেভ
// // POST /api/orders
// // দুই রকম অর্ডার আসে:
// //  ১. ক্যাশ অন ডেলিভারি — কার্ট পেজ থেকে সরাসরি (paymentMethod: "COD")
// //  ২. অনলাইন পেমেন্ট — SSLCommerz এ টাকা দেওয়ার পর /payment/success পেজ থেকে
// // =========================
// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { userEmail, products, total } = body;

//     if (!userEmail || !Array.isArray(products) || products.length === 0) {
//       return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
//     }

//     const amount = Number(total);
//     if (!Number.isFinite(amount) || amount < 0) {
//       return NextResponse.json({ success: false, message: "অর্ডারের টাকার পরিমাণ ঠিক নেই" }, { status: 400 });
//     }

//     const isCOD = body.paymentMethod === "COD";

//     // ডেলিভারির তথ্য — COD তে অবশ্যই লাগবে
//     const shipping = body.shipping
//       ? {
//           name: String(body.shipping.name || "").trim(),
//           phone: normalizePhone(body.shipping.phone),
//           address: String(body.shipping.address || "").trim(),
//           note: String(body.shipping.note || "").trim(),
//         }
//       : null;
//     if (isCOD) {
//       const err = shippingError(shipping || {});
//       if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });
//     }

//     const db = await dbConnect();

//     const order = {
//       userEmail,
//       products: products.map((p) => ({
//         _id: p._id,
//         title: p.title,
//         author: p.author || "",
//         img: p.img || p.image || "",
//         price: Number(p.price) || 0,
//         qty: Math.max(1, Number(p.qty) || 1),
//       })),
//       total: amount,
//       originalAmount: Number(body.originalAmount) || amount,
//       discountAmount: Number(body.discountAmount) || 0,
//       couponCode: body.couponCode || null,
//       paymentMethod: isCOD ? "COD" : "Online",
//       // COD তে টাকা ডেলিভারির সময় পাওয়া যায়, তাই শুরুতে সবসময় "Unpaid" —
//       // ব্রাউজার যা-ই পাঠাক, সার্ভার নিজে ঠিক করে
//       payment: isCOD ? "Unpaid" : body.payment || "Paid",
//       status: "Pending",
//       shipping,
//       createdAt: new Date(),
//       // অনলাইনে টাকা এখনই এসেছে; COD তে আসবে অ্যাডমিন নিশ্চিত করলে (তখন paidAt বসে)
//       paidAt: isCOD ? null : new Date(),
//     };

//     const result = await db.collection("orders").insertOne(order);

//     // COD তে কুপন ব্যবহারের হিসাব (অনলাইনে এটা /api/payment এ হয়)
//     if (isCOD && order.couponCode) {
//       try {
//         await db.collection("coupons").updateOne(
//           { code: String(order.couponCode).toUpperCase().trim() },
//           { $inc: { usedCount: 1 }, $addToSet: { usedBy: userEmail } }
//         );
//       } catch (e) {
//         console.log("COUPON RECORD ERROR:", e.message);
//       }
//     }

//     // বিক্রির সংখ্যা বাড়ানো আর স্টক কমানো
//     try {
//       for (const item of order.products) {
//         if (!item?._id || !ObjectId.isValid(item._id)) continue;
//         await db.collection("products").updateOne({ _id: new ObjectId(item._id) }, { $inc: { sold: item.qty } });
//         await db.collection("products").updateOne(
//           { _id: new ObjectId(item._id), stock: { $gte: item.qty } },
//           { $inc: { stock: -item.qty } }
//         );
//       }
//     } catch (e) {
//       console.log("SOLD COUNT ERROR:", e.message);
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Order saved successfully",
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.log("ORDER SAVE ERROR:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// // =========================
// // GET ALL ORDERS
// // =========================
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
//       {
//         success: false,
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }




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
import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";
import { normalizePhone, shippingError } from "@/lib/orders";

// =========================
// ✅ অর্ডার সেভ
// POST /api/orders
// দুই রকম অর্ডার আসে:
//  ১. ক্যাশ অন ডেলিভারি — কার্ট পেজ থেকে সরাসরি (paymentMethod: "COD")
//  ২. অনলাইন পেমেন্ট — SSLCommerz এ টাকা দেওয়ার পর /payment/success পেজ থেকে
// =========================
export async function POST(req) {
  try {
    const body = await req.json();
    const { userEmail, products, total } = body;

    if (!userEmail || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
    }

    const amount = Number(total);
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ success: false, message: "অর্ডারের টাকার পরিমাণ ঠিক নেই" }, { status: 400 });
    }

    const isCOD = body.paymentMethod === "COD";

    // ডেলিভারির তথ্য — COD তে অবশ্যই লাগবে
    const shipping = body.shipping
      ? {
          name: String(body.shipping.name || "").trim(),
          phone: normalizePhone(body.shipping.phone),
          address: String(body.shipping.address || "").trim(),
          note: String(body.shipping.note || "").trim(),
        }
      : null;
    if (isCOD) {
      const err = shippingError(shipping || {});
      if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });
    }

    const db = await dbConnect();

    const order = {
      userEmail,
      products: products.map((p) => ({
        _id: p._id,
        title: p.title,
        author: p.author || "",
        img: p.img || p.image || "",
        price: Number(p.price) || 0,
        qty: Math.max(1, Number(p.qty) || 1),
      })),
      total: amount,
      originalAmount: Number(body.originalAmount) || amount,
      discountAmount: Number(body.discountAmount) || 0,
      couponCode: body.couponCode || null,
      paymentMethod: isCOD ? "COD" : "Online",
      // COD তে টাকা ডেলিভারির সময় পাওয়া যায়, তাই শুরুতে সবসময় "Unpaid" —
      // ব্রাউজার যা-ই পাঠাক, সার্ভার নিজে ঠিক করে
      payment: isCOD ? "Unpaid" : body.payment || "Paid",
      // status: "Pending",
      status: "Approved",
orderStatus: "Approved",
      shipping,
      createdAt: new Date(),
      // ট্র্যাকিং: কোন ধাপ কখন হলো
      timeline: { Pending: new Date() },
      // অনলাইনে টাকা এখনই এসেছে; COD তে আসবে অ্যাডমিন নিশ্চিত করলে (তখন paidAt বসে)
      paidAt: isCOD ? null : new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    // COD তে কুপন ব্যবহারের হিসাব (অনলাইনে এটা /api/payment এ হয়)
    if (isCOD && order.couponCode) {
      try {
        await db.collection("coupons").updateOne(
          { code: String(order.couponCode).toUpperCase().trim() },
          { $inc: { usedCount: 1 }, $addToSet: { usedBy: userEmail } }
        );
      } catch (e) {
        console.log("COUPON RECORD ERROR:", e.message);
      }
    }

    // বিক্রির সংখ্যা বাড়ানো আর স্টক কমানো
    try {
      for (const item of order.products) {
        if (!item?._id || !ObjectId.isValid(item._id)) continue;
        await db.collection("products").updateOne({ _id: new ObjectId(item._id) }, { $inc: { sold: item.qty } });
        await db.collection("products").updateOne(
          { _id: new ObjectId(item._id), stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } }
        );
      }
    } catch (e) {
      console.log("SOLD COUNT ERROR:", e.message);
    }

    return NextResponse.json({
      success: true,
      message: "Order saved successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.log("ORDER SAVE ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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