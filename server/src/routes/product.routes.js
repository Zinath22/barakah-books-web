import { Router } from "express";
import * as c from "../controllers/product.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const r = Router();
r.get("/", c.getProducts);
r.get("/:id", c.getProduct);
r.post("/", verifyToken, verifyAdmin, c.createProduct);
r.patch("/:id", verifyToken, verifyAdmin, c.updateProduct);
r.delete("/:id", verifyToken, verifyAdmin, c.deleteProduct);
export default r;
