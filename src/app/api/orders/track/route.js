import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { normalizePhone, orderCode, orderStatus, orderTotal, paymentInfo, trackSteps } from "@/lib/orders";

// =========================
// অর্ডার ট্র্যাক (লগইন ছাড়াই)
// GET /api/orders/track?order=DF5BF8&phone=01XXXXXXXXX
// GET /api/orders/track?order=DF5BF8&email=...   (লগইন করা ইউজারের "আমার অর্ডার" থেকে)
// অর্ডার নম্বরের সাথে অর্ডারের মোবাইল নম্বর (বা ইমেইল) মিলতে হবে — তাই অন্যের অর্ডার দেখা যায় না
// =========================
export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const code = String(sp.get("order") || "").replace(/[#\s]/g, "").toUpperCase();
    const phone = sp.get("phone") ? normalizePhone(sp.get("phone")) : "";
    const email = String(sp.get("email") || "").trim();

    if (!/^[0-9A-F]{6}([0-9A-F]{18})?$/.test(code)) {
      return NextResponse.json({ success: false, message: "সঠিক অর্ডার নম্বর দিন (যেমন DF5BF8)" }, { status: 400 });
    }
    if (!phone && !email) {
      return NextResponse.json({ success: false, message: "অর্ডারের মোবাইল নম্বর দিন" }, { status: 400 });
    }

    const db = await dbConnect();
    const filter = phone ? { "shipping.phone": phone } : { userEmail: email };
    const candidates = await db.collection("orders").find(filter).sort({ createdAt: -1 }).toArray();
    const order = candidates.find((o) => String(o._id).toUpperCase().endsWith(code));

    if (!order) {
      return NextResponse.json(
        { success: false, message: "এই অর্ডার নম্বর আর মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // শুধু ট্র্যাকিংয়ের দরকারি তথ্য পাঠানো হয় — ইমেইল বা পুরো ঠিকানা না
    const pay = paymentInfo(order);
    return NextResponse.json({
      success: true,
      order: {
        code: orderCode(order),
        createdAt: order.createdAt,
        status: orderStatus(order).value,
        steps: trackSteps(order),
        cancelledAt: order.timeline?.Cancelled || null,
        courierNote: order.courierNote || "",
        name: order.shipping?.name || "",
        items: (order.products || []).map((p) => ({ title: p.title, qty: p.qty || 1 })),
        total: orderTotal(order),
        payment: { method: pay.method, paid: pay.paid, label: pay.label },
      },
    });
  } catch (error) {
    console.log("TRACK ORDER ERROR:", error);
    return NextResponse.json({ success: false, message: "এখন ট্র্যাক করা যাচ্ছে না, একটু পরে চেষ্টা করুন" }, { status: 500 });
  }
}