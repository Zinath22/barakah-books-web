import { ObjectId } from "mongodb";
import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

// Cart document: { userEmail, items: [{ productId, qty }], updatedAt }

async function populatedCart(email) {
  const cart = await col("carts").findOne({ userEmail: email });
  const items = cart?.items || [];
  const ids = items.filter((i) => ObjectId.isValid(i.productId)).map((i) => new ObjectId(i.productId));
  const products = await col("products").find({ _id: { $in: ids } }).toArray();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const result = items
    .map((i) => ({ ...i, product: byId.get(i.productId) || null }))
    .filter((i) => i.product);
  const subtotal = result.reduce((s, i) => s + (Number(i.product.price) || 0) * i.qty, 0);

  return { items: result, count: result.reduce((s, i) => s + i.qty, 0), subtotal };
}

const save = (email, items) =>
  col("carts").updateOne(
    { userEmail: email },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true }
  );

// GET /api/cart
export async function getCart(req, res) {
  res.json({ success: true, cart: await populatedCart(req.user.email) });
}

// POST /api/cart/items  body: { productId, qty = 1 }  (thakle qty barbe)
export async function addItem(req, res) {
  const { productId, qty = 1 } = req.body || {};
  if (!ObjectId.isValid(productId)) throw new ApiError(400, "Invalid productId");
  const exists = await col("products").findOne({ _id: new ObjectId(productId) }, { projection: { _id: 1 } });
  if (!exists) throw new ApiError(404, "Product not found");

  const cart = await col("carts").findOne({ userEmail: req.user.email });
  const items = cart?.items || [];
  const found = items.find((i) => i.productId === productId);
  if (found) found.qty = Math.min(found.qty + Number(qty || 1), 99);
  else items.push({ productId, qty: Math.max(1, Math.min(Number(qty) || 1, 99)) });

  await save(req.user.email, items);
  res.json({ success: true, cart: await populatedCart(req.user.email) });
}

// PATCH /api/cart/items/:productId  body: { qty }  (qty 0 hole remove)
export async function updateItem(req, res) {
  const { productId } = req.params;
  const qty = Number(req.body?.qty);
  if (Number.isNaN(qty) || qty < 0) throw new ApiError(400, "Invalid qty");

  const cart = await col("carts").findOne({ userEmail: req.user.email });
  let items = cart?.items || [];
  if (qty === 0) items = items.filter((i) => i.productId !== productId);
  else {
    const found = items.find((i) => i.productId === productId);
    if (!found) throw new ApiError(404, "Item not in cart");
    found.qty = Math.min(qty, 99);
  }

  await save(req.user.email, items);
  res.json({ success: true, cart: await populatedCart(req.user.email) });
}

// DELETE /api/cart/items/:productId
export async function removeItem(req, res) {
  const cart = await col("carts").findOne({ userEmail: req.user.email });
  const items = (cart?.items || []).filter((i) => i.productId !== req.params.productId);
  await save(req.user.email, items);
  res.json({ success: true, cart: await populatedCart(req.user.email) });
}

// DELETE /api/cart
export async function clearCart(req, res) {
  await save(req.user.email, []);
  res.json({ success: true, message: "Cart cleared" });
}

// GET /api/cart/all  (admin)
export async function getAllCarts(req, res) {
  const carts = await col("carts").find({}).sort({ updatedAt: -1 }).toArray();
  res.json({ success: true, carts });
}
