import { ObjectId } from "mongodb";
import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";

// Client jeno _id / createdAt override korte na pare
const clean = ({ _id, createdAt, ...rest }) => rest;

// GET /api/products?search=&category=&sort=price_asc|price_desc|rating|newest&page=&limit=
export async function getProducts(req, res) {
  const { search, category, sort, page, limit } = req.query;
  const filter = {};

  if (search) {
    // বইয়ের নাম, লেখক, অনুবাদক বা প্রকাশনী — যেকোনোটা মিললেই
    const rx = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ title: rx }, { author: rx }, { translator: rx }, { publisher: rx }];
  }
  if (category) filter.category = category;

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
    popular: { sold: -1 },
  };

  let cursor = col("products").find(filter).sort(sortMap[sort] || { _id: 1 });

  const lim = Math.min(Number(limit) || 0, 100);
  const pg = Math.max(Number(page) || 1, 1);
  if (lim) cursor = cursor.skip((pg - 1) * lim).limit(lim);

  const [products, total] = await Promise.all([cursor.toArray(), col("products").countDocuments(filter)]);

  res.json({ success: true, total, page: pg, products });
}

// GET /api/products/:id  (ObjectId, numeric id, ba slug — sob support kore)
export async function getProduct(req, res) {
  const { id } = req.params;
  const or = [{ slug: id }, { id }];
  if (ObjectId.isValid(id)) or.unshift({ _id: new ObjectId(id) });
  if (!Number.isNaN(Number(id))) or.push({ id: Number(id) });

  const product = await col("products").findOne({ $or: or });
  if (!product) throw new ApiError(404, "Product not found");

  res.json({ success: true, product });
}

// POST /api/products  (admin)
export async function createProduct(req, res) {
  const body = clean(req.body || {});
  if (!body.title || body.price === undefined) throw new ApiError(400, "title and price are required");

  body.price = Number(body.price);
  if (Number.isNaN(body.price) || body.price < 0) throw new ApiError(400, "Invalid price");

  const result = await col("products").insertOne({ ...body, createdAt: new Date() });
  res.status(201).json({ success: true, insertedId: result.insertedId });
}

// PATCH /api/products/:id  (admin)
export async function updateProduct(req, res) {
  const _id = toObjectId(req.params.id, "product ID");
  const body = clean(req.body || {});
  if (body.price !== undefined) body.price = Number(body.price);

  const result = await col("products").updateOne({ _id }, { $set: { ...body, updatedAt: new Date() } });
  if (!result.matchedCount) throw new ApiError(404, "Product not found");

  res.json({ success: true, message: "Product updated" });
}

// DELETE /api/products/:id  (admin)
export async function deleteProduct(req, res) {
  const _id = toObjectId(req.params.id, "product ID");
  const result = await col("products").deleteOne({ _id });
  if (!result.deletedCount) throw new ApiError(404, "Product not found");

  res.json({ success: true, message: "Product deleted" });
}
