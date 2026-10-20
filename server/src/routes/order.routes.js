import { Router } from "express";
import * as c from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const r = Router();
r.use(verifyToken);
r.post("/", c.createCodOrder);
r.get("/my", c.getMyOrders);
r.get("/", verifyAdmin, c.getAllOrders);
r.get("/:id", c.getOrder);
r.patch("/:id/cancel", c.cancelMyOrder);
r.patch("/:id/status", verifyAdmin, c.updateOrderStatus);
export default r;
