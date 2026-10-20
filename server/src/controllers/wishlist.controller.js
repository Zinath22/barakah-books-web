import { ObjectId } from "mongodb";
import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

// Wishlist document: { userEmail, productIds: [string] }

async function getProducts(email) {
  const doc = await col("wishlists").findOne({ userEmail: email });
  const ids = (doc?.productIds || []).filter(ObjectId.isValid).map((id) => new ObjectId(id));
  return col("products").find({ _id: { $in: ids } }).toArray();
}

// GET /api/wishlist
export async function getWishlist(req, res) {
  res.json({ success: true, products: await getProducts(req.user.email) });
}

// POST /api/wishlist/:productId
export async function addToWishlist(req, res) {
  const { productId } = req.params;
  if (!ObjectId.isValid(productId)) throw new ApiError(400, "Invalid productId");

  await col("wishlists").updateOne(
    { userEmail: req.user.email },
    { $addToSet: { productIds: productId }, $set: { updatedAt: new Date() } },
    { upsert: true }
  );
  res.json({ success: true, message: "Added to wishlist" });
}

// DELETE /api/wishlist/:productId
export async function removeFromWishlist(req, res) {
  await col("wishlists").updateOne(
    { userEmail: req.user.email },
    { $pull: { productIds: req.params.productId }, $set: { updatedAt: new Date() } }
  );
  res.json({ success: true, message: "Removed from wishlist" });
}
