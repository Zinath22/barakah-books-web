import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";
import { applyCoupon } from "../utils/pricing.js";

function parseCoupon(body, partial = false) {
  const out = {};
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit, isActive } = body;

  if (!partial && (!code || !discountType || !discountValue || !expiryDate))
    throw new ApiError(400, "Missing required fields");

  if (code !== undefined) out.code = String(code).toUpperCase().trim();
  if (discountType !== undefined) {
    if (!["percentage", "fixed"].includes(discountType)) throw new ApiError(400, "Invalid discount type");
    out.discountType = discountType;
  }
  if (discountValue !== undefined) {
    out.discountValue = Number(discountValue);
    if (!(out.discountValue > 0)) throw new ApiError(400, "Discount value must be greater than 0");
  }
  if ((out.discountType || "") === "percentage" && out.discountValue > 100)
    throw new ApiError(400, "Percentage discount cannot exceed 100%");
  if (minOrderAmount !== undefined) out.minOrderAmount = Number(minOrderAmount) || 0;
  if (maxDiscount !== undefined) out.maxDiscount = Number(maxDiscount) || 0;
  if (expiryDate !== undefined) out.expiryDate = new Date(expiryDate);
  if (usageLimit !== undefined) out.usageLimit = Number(usageLimit) || 0;
  if (isActive !== undefined) out.isActive = Boolean(isActive);
  return out;
}

// GET /api/coupons  (admin)
export async function getCoupons(req, res) {
  const coupons = await col("coupons").find({}).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, coupons });
}

// POST /api/coupons  (admin)
export async function createCoupon(req, res) {
  const data = parseCoupon(req.body || {});
  if (await col("coupons").findOne({ code: data.code })) throw new ApiError(409, "Coupon code already exists");

  const result = await col("coupons").insertOne({
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    ...data,
    usedCount: 0,
    usedBy: [],
    isActive: true,
    createdAt: new Date(),
  });
  res.status(201).json({ success: true, message: "Coupon created successfully", insertedId: result.insertedId });
}

// PATCH /api/coupons/:id  (admin)
export async function updateCoupon(req, res) {
  const _id = toObjectId(req.params.id, "coupon ID");
  const data = parseCoupon(req.body || {}, true);

  if (data.code && (await col("coupons").findOne({ code: data.code, _id: { $ne: _id } })))
    throw new ApiError(409, "Coupon code already exists");

  const result = await col("coupons").updateOne({ _id }, { $set: data });
  if (!result.matchedCount) throw new ApiError(404, "Coupon not found");
  res.json({ success: true, message: "Coupon updated successfully" });
}

// DELETE /api/coupons/:id  (admin)
export async function deleteCoupon(req, res) {
  const _id = toObjectId(req.params.id, "coupon ID");
  const result = await col("coupons").deleteOne({ _id });
  if (!result.deletedCount) throw new ApiError(404, "Coupon not found");
  res.json({ success: true, message: "Coupon deleted successfully" });
}

// POST /api/coupons/validate  (logged in)  body: { code, orderAmount }
export async function validateCoupon(req, res) {
  const { code, orderAmount } = req.body || {};
  if (!code) throw new ApiError(400, "Please enter a coupon code");
  if (!(Number(orderAmount) > 0)) throw new ApiError(400, "Invalid order amount");

  const result = await applyCoupon(code, Number(orderAmount), req.user.email);
  res.json({ success: true, message: "Coupon applied successfully", ...result });
}
