import { Router } from "express";
import * as c from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const r = Router();
r.use(verifyToken);
r.get("/all", verifyAdmin, c.getAllCarts);
r.get("/", c.getCart);
r.delete("/", c.clearCart);
r.post("/items", c.addItem);
r.patch("/items/:productId", c.updateItem);
r.delete("/items/:productId", c.removeItem);
export default r;
