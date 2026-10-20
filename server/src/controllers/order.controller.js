import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";
import { priceOrder, recordCouponUse, recordSales } from "../utils/pricing.js";

export const ORDER_STATUSES = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"];

export function buildCustomer(user, body = {}) {
  return {
    name: body.name || user.name || "Customer",
    phone: body.phone || user.dbUser?.phone || "",
    address: body.address || user.dbUser?.address || "",
    city: body.city || "Dhaka",
  };
}

// POST /api/orders  (logged in) — Cash on Delivery order
// body: { items: [{ productId, qty }], couponCode?, name?, phone, address, city? }
export async function createCodOrder(req, res) {
  const { items, couponCode } = req.body || {};
  const customer = buildCustomer(req.user, req.body);
  if (!customer.phone || !customer.address) throw new ApiError(400, "phone and address are required");

  const priced = await priceOrder(items, couponCode, req.user.email);

  const order = {
    userEmail: req.user.email,
    customer,
    ...priced,
    paymentMethod: "COD",
    paymentStatus: "Unpaid",
    status: "Pending",
    orderStatus: "Pending",
    createdAt: new Date(),
  };

  const result = await col("orders").insertOne(order);
  await recordCouponUse(priced.couponCode, req.user.email);
  await recordSales(priced.products);
  await col("carts").updateOne({ userEmail: req.user.email }, { $set: { items: [] } });

  res.status(201).json({ success: true, message: "Order placed", orderId: result.insertedId, order });
}

// GET /api/orders/my  (logged in)
export async function getMyOrders(req, res) {
  const orders = await col("orders").find({ userEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, orders });
}

// GET /api/orders/:id  (owner ba admin)
export async function getOrder(req, res) {
  const order = await col("orders").findOne({ _id: toObjectId(req.params.id, "order ID") });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.userEmail !== req.user.email && req.user.role !== "admin") throw new ApiError(403, "Forbidden");
  res.json({ success: true, order });
}

// GET /api/orders?status=  (admin)
export async function getAllOrders(req, res) {
  const filter = req.query.status ? { status: req.query.status } : {};
  const orders = await col("orders").find(filter).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, orders });
}

// PATCH /api/orders/:id/status  (admin)  body: { status }
export async function updateOrderStatus(req, res) {
  const _id = toObjectId(req.params.id, "order ID");
  const status = req.body?.status || "Approved";
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, `status must be one of: ${ORDER_STATUSES.join(", ")}`);

  const result = await col("orders").updateOne(
    { _id },
    { $set: { status, orderStatus: status, updatedAt: new Date() } }
  );
  if (!result.matchedCount) throw new ApiError(404, "Order not found");
  res.json({ success: true, message: `Order ${status.toLowerCase()}` });
}

// PATCH /api/orders/:id/cancel  (owner, shudhu Pending order)
export async function cancelMyOrder(req, res) {
  const _id = toObjectId(req.params.id, "order ID");
  const order = await col("orders").findOne({ _id, userEmail: req.user.email });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "Pending") throw new ApiError(400, "Only pending orders can be cancelled");

  await col("orders").updateOne({ _id }, { $set: { status: "Cancelled", orderStatus: "Cancelled", updatedAt: new Date() } });
  res.json({ success: true, message: "Order cancelled" });
}
