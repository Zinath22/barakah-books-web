import admin from "../config/firebase.js";
import { col } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

// Header: Authorization: Bearer <Firebase ID token>
export async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw new ApiError(401, "Unauthorized: token missing");
  if (!admin.apps.length) throw new ApiError(500, "Firebase Admin is not configured");

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch {
    throw new ApiError(401, "Unauthorized: invalid or expired token");
  }

  // MongoDB theke role ana hoy (role DB te thake, token e na)
  const dbUser = await col("users").findOne(
    { email: decoded.email },
    { projection: { password: 0 } }
  );

  req.user = {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name || dbUser?.name || "",
    picture: decoded.picture || dbUser?.image || "",
    role: dbUser?.role || "user",
    dbUser,
  };

  next();
}
