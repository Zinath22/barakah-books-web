import { ApiError } from "../utils/ApiError.js";

// verifyToken er porei use korte hobe
export function verifyAdmin(req, res, next) {
  if (req.user?.role !== "admin") throw new ApiError(403, "Forbidden: admin only");
  next();
}
