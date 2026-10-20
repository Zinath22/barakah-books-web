import { Router } from "express";
import * as c from "../controllers/coupon.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const r = Router();
r.use(verifyToken);
r.post("/validate", c.validateCoupon);
r.get("/", verifyAdmin, c.getCoupons);
r.post("/", verifyAdmin, c.createCoupon);
r.patch("/:id", verifyAdmin, c.updateCoupon);
r.delete("/:id", verifyAdmin, c.deleteCoupon);
export default r;
