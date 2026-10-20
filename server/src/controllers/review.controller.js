import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";

// GET /api/reviews?productId=
export async function getReviews(req, res) {
  const { productId } = req.query;
  if (!productId) throw new ApiError(400, "productId is required");

  const reviews = await col("reviews").find({ productId }).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, reviews });
}

// POST /api/reviews  (logged in)  body: { productId, rating, comment }
export async function addReview(req, res) {
  const { productId, rating, comment } = req.body || {};
  const productObjectId = toObjectId(productId, "product ID");
  const r = Number(rating);
  if (!r || r < 1 || r > 5) throw new ApiError(400, "Rating must be between 1 and 5");

  const product = await col("products").findOne({ _id: productObjectId }, { projection: { _id: 1 } });
  if (!product) throw new ApiError(404, "Product not found");

  await col("reviews").insertOne({
    productId,
    rating: r,
    comment: (comment || "").toString().trim(),
    userEmail: req.user.email,
    userName: req.user.name,
    userImage: req.user.picture,
    createdAt: new Date(),
  });

  // Product er average rating update
  const [stats] = await col("reviews")
    .aggregate([{ $match: { productId } }, { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }])
    .toArray();

  await col("products").updateOne(
    { _id: productObjectId },
    { $set: { rating: Number(stats.avg.toFixed(1)), reviews: stats.count } }
  );

  res.status(201).json({ success: true, message: "Review added" });
}
