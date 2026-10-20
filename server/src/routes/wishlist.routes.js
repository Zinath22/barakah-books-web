import { Router } from "express";
import * as c from "../controllers/wishlist.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const r = Router();
r.use(verifyToken);
r.get("/", c.getWishlist);
r.post("/:productId", c.addToWishlist);
r.delete("/:productId", c.removeFromWishlist);
export default r;
