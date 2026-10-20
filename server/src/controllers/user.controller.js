import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";

// POST /api/users/save  (logged in) — login/register er pore call korte hobe
// Token theke email nea hoy, tai keu onner nam e user banate parbe na
export async function saveUser(req, res) {
  const { name, image, phone } = req.body || {};
  const { email } = req.user;

  const update = { lastLoginAt: new Date() };
  if (name || req.user.name) update.name = name || req.user.name;
  if (image || req.user.picture) update.image = image || req.user.picture;
  if (phone) update.phone = phone;

  await col("users").updateOne(
    { email },
    { $set: update, $setOnInsert: { email, role: "user", createdAt: new Date() } },
    { upsert: true }
  );

  const user = await col("users").findOne({ email }, { projection: { password: 0, verifyToken: 0 } });
  res.json({ success: true, user });
}

// GET /api/users/me  (logged in)
export async function getMe(req, res) {
  const user = await col("users").findOne(
    { email: req.user.email },
    { projection: { password: 0, verifyToken: 0 } }
  );
  if (!user) throw new ApiError(404, "User not found. Call POST /api/users/save first.");
  res.json({ success: true, user });
}

// PATCH /api/users/me  (logged in)  body: { name, image, phone, address }
export async function updateMe(req, res) {
  const allowed = ["name", "image", "phone", "address"];
  const update = Object.fromEntries(
    Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
  );
  if (!Object.keys(update).length) throw new ApiError(400, "Nothing to update");

  await col("users").updateOne({ email: req.user.email }, { $set: { ...update, updatedAt: new Date() } });
  res.json({ success: true, message: "Profile updated" });
}

// GET /api/users  (admin)
export async function getUsers(req, res) {
  const users = await col("users")
    .find({})
    .project({ password: 0, verifyToken: 0 })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ success: true, users });
}

// PATCH /api/users/:id/make-admin  (admin)
export async function makeAdmin(req, res) {
  const _id = toObjectId(req.params.id, "user ID");
  const result = await col("users").updateOne({ _id }, { $set: { role: "admin" } });
  if (!result.matchedCount) throw new ApiError(404, "User not found");
  res.json({ success: true, message: "User promoted to admin" });
}

// DELETE /api/users/:id  (admin)
export async function deleteUser(req, res) {
  const _id = toObjectId(req.params.id, "user ID");
  const user = await col("users").findOne({ _id });
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Admin cannot be deleted");

  await col("users").deleteOne({ _id });
  res.json({ success: true, message: "User deleted successfully" });
}
