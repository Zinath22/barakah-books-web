import crypto from "node:crypto";
import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { priceOrder, recordCouponUse, recordSales } from "../utils/pricing.js";
import { buildCustomer } from "./order.controller.js";

const isLive = () => process.env.SSL_IS_LIVE === "true";
const sslBase = () => (isLive() ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");

// Payment sesh hole ei URL e redirect hobe.
// Flutter WebView ei path gulo ("/payment/success", "/payment/fail", "/payment/cancel") dhorbe.
const resultUrl = (status, tranId) =>
  `${process.env.CLIENT_URL || process.env.SERVER_URL}/payment/${status}?tran_id=${encodeURIComponent(tranId)}`;

// POST /api/payment/init  (logged in)
// body: { items: [{ productId, qty }], couponCode?, name?, phone, address, city? }
// response: { url, tranId }  -> web: window.location = url, Flutter: WebView e url khulbe
export async function initPayment(req, res) {
  const { items, couponCode } = req.body || {};
  const customer = buildCustomer(req.user, req.body);
  if (!customer.phone || !customer.address) throw new ApiError(400, "phone and address are required");

  const priced = await priceOrder(items, couponCode, req.user.email);
  if (priced.total <= 0) throw new ApiError(400, "Order total must be greater than 0");

  const tranId = `BM${Date.now()}${crypto.randomInt(100, 999)}`;
  const server = process.env.SERVER_URL;

  const form = new URLSearchParams({
    store_id: process.env.STORE_ID,
    store_passwd: process.env.STORE_PASSWORD,
    total_amount: priced.total.toFixed(2),
    currency: "BDT",
    tran_id: tranId,
    success_url: `${server}/api/payment/success/${tranId}`,
    fail_url: `${server}/api/payment/fail/${tranId}`,
    cancel_url: `${server}/api/payment/cancel/${tranId}`,
    ipn_url: `${server}/api/payment/ipn`,
    cus_name: customer.name,
    cus_email: req.user.email,
    cus_add1: customer.address,
    cus_city: customer.city,
    cus_postcode: "1200",
    cus_country: "Bangladesh",
    cus_phone: customer.phone,
    shipping_method: "Courier",
    ship_name: customer.name,
    ship_add1: customer.address,
    ship_city: customer.city,
    ship_postcode: "1200",
    ship_country: "Bangladesh",
    product_name: priced.products.map((p) => p.title).join(", ").slice(0, 250) || "Islamic Books",
    product_category: "Books",
    product_profile: "general",
    num_of_item: String(priced.products.length),
  });

  const sslRes = await fetch(`${sslBase()}/gwprocess/v4/api.php`, { method: "POST", body: form });
  const data = await sslRes.json();
  if (!data.GatewayPageURL) throw new ApiError(502, data.failedreason || "SSLCommerz error");

  await col("orders").insertOne({
    userEmail: req.user.email,
    customer,
    ...priced,
    paymentMethod: "SSLCommerz",
    paymentStatus: "Pending",
    status: "Pending",
    orderStatus: "Pending",
    transactionId: tranId,
    createdAt: new Date(),
  });

  res.json({ success: true, url: data.GatewayPageURL, tranId });
}

// SSLCommerz er validation API diye payment ashol kina check kora
async function validateWithSsl(valId) {
  const qs = new URLSearchParams({
    val_id: valId,
    store_id: process.env.STORE_ID,
    store_passwd: process.env.STORE_PASSWORD,
    format: "json",
  });
  const r = await fetch(`${sslBase()}/validator/api/validationserverAPI.php?${qs}`);
  return r.json();
}

async function markPaid(tranId, valId) {
  const order = await col("orders").findOne({ transactionId: tranId });
  if (!order) return { ok: false, reason: "order not found" };
  if (order.paymentStatus === "Paid") return { ok: true };

  const v = await validateWithSsl(valId);
  const valid =
    ["VALID", "VALIDATED"].includes(v.status) &&
    v.tran_id === tranId &&
    Math.abs(Number(v.amount) - Number(order.total)) < 1;

  if (!valid) {
    await col("orders").updateOne({ _id: order._id }, { $set: { paymentStatus: "Failed", sslStatus: v.status } });
    return { ok: false, reason: "validation failed" };
  }

  // paymentStatus Pending thaklei update — duplicate callback e coupon 2 bar count hobe na
  const upd = await col("orders").updateOne(
    { _id: order._id, paymentStatus: { $ne: "Paid" } },
    { $set: { paymentStatus: "Paid", valId, bankTranId: v.bank_tran_id, cardType: v.card_type, paidAt: new Date() } }
  );
  if (upd.modifiedCount) {
    await recordCouponUse(order.couponCode, order.userEmail);
    await recordSales(order.products);
    await col("carts").updateOne({ userEmail: order.userEmail }, { $set: { items: [] } });
  }
  return { ok: true };
}

// POST /api/payment/success/:tranId  (SSLCommerz call kore)
export async function paymentSuccess(req, res) {
  const { tranId } = req.params;
  const { ok } = await markPaid(tranId, req.body?.val_id);
  res.redirect(303, resultUrl(ok ? "success" : "fail", tranId));
}

// POST /api/payment/fail/:tranId
export async function paymentFail(req, res) {
  const { tranId } = req.params;
  await col("orders").updateOne(
    { transactionId: tranId, paymentStatus: "Pending" },
    { $set: { paymentStatus: "Failed", status: "Cancelled", orderStatus: "Cancelled" } }
  );
  res.redirect(303, resultUrl("fail", tranId));
}

// POST /api/payment/cancel/:tranId
export async function paymentCancel(req, res) {
  const { tranId } = req.params;
  await col("orders").updateOne(
    { transactionId: tranId, paymentStatus: "Pending" },
    { $set: { paymentStatus: "Cancelled", status: "Cancelled", orderStatus: "Cancelled" } }
  );
  res.redirect(303, resultUrl("cancel", tranId));
}

// POST /api/payment/ipn  (SSLCommerz server-to-server notification)
export async function paymentIpn(req, res) {
  const { tran_id, val_id, status } = req.body || {};
  if (tran_id && val_id && status === "VALID") await markPaid(tran_id, val_id);
  res.json({ received: true });
}

// GET /api/payment/status/:tranId  (logged in) — app e result dekhanor jonno
export async function paymentStatus(req, res) {
  const order = await col("orders").findOne({ transactionId: req.params.tranId, userEmail: req.user.email });
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, paymentStatus: order.paymentStatus, order });
}
