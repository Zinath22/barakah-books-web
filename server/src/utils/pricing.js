import { ObjectId } from "mongodb";
import { col } from "../config/db.js";
import { ApiError } from "./ApiError.js";

const round2 = (n) => Math.round(n * 100) / 100;

// Coupon check + discount hisab (web er /api/coupons/validate er same logic)
export async function applyCoupon(code, orderAmount, userEmail) {
  const coupon = await col("coupons").findOne({ code: code.toUpperCase().trim() });

  if (!coupon) throw new ApiError(400, "Invalid coupon code");
  if (!coupon.isActive) throw new ApiError(400, "This coupon is no longer active");
  if (new Date() > new Date(coupon.expiryDate)) throw new ApiError(400, "This coupon has expired");
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    throw new ApiError(400, "This coupon has reached its usage limit");
  if (userEmail && coupon.usedBy?.includes(userEmail))
    throw new ApiError(400, "You have already used this coupon");
  if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount)
    throw new ApiError(400, `Minimum order amount is TK ${coupon.minOrderAmount}`);

  let discountAmount;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount > 0) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = Math.min(coupon.discountValue, orderAmount);
  }

  discountAmount = round2(discountAmount);
  return {
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
    },
    discountAmount,
    finalAmount: round2(Math.max(0, orderAmount - discountAmount)),
  };
}

// items: [{ productId, qty }]
// Dam (price) DB theke nea hoy — client je price pathabe seta bishshash kora hoy na
export async function priceOrder(items, couponCode, userEmail) {
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, "items are required");

  const ids = items.map((i) => {
    if (!ObjectId.isValid(i.productId)) throw new ApiError(400, `Invalid productId: ${i.productId}`);
    return new ObjectId(i.productId);
  });

  const products = await col("products").find({ _id: { $in: ids } }).toArray();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const lines = items.map((i) => {
    const p = byId.get(String(i.productId));
    if (!p) throw new ApiError(404, `Product not found: ${i.productId}`);
    const qty = Math.max(1, Math.min(Number(i.qty) || 1, 99));
    const price = Number(p.price) || 0;
    return { productId: p._id.toString(), title: p.title, img: p.img || p.image || "", price, qty, lineTotal: round2(price * qty) };
  });

  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  let discountAmount = 0;
  let total = subtotal;
  let coupon = null;

  if (couponCode) {
    const r = await applyCoupon(couponCode, subtotal, userEmail);
    discountAmount = r.discountAmount;
    total = r.finalAmount;
    coupon = r.coupon.code;
  }

  return { products: lines, subtotal, discountAmount, total, couponCode: coupon };
}

export async function recordCouponUse(code, email) {
  if (!code) return;
  await col("coupons").updateOne({ code }, { $inc: { usedCount: 1 }, $addToSet: { usedBy: email } });
}

// অর্ডার হলে বিক্রির সংখ্যা বাড়ানো আর স্টক কমানো
export async function recordSales(products = []) {
  for (const p of products) {
    if (!ObjectId.isValid(p.productId)) continue;
    const _id = new ObjectId(p.productId);
    await col("products").updateOne({ _id }, { $inc: { sold: p.qty } });
    await col("products").updateOne({ _id, stock: { $gte: p.qty } }, { $inc: { stock: -p.qty } });
  }
}
