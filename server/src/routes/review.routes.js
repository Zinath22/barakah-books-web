import { Router } from "express";
import * as c from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const r = Router();
r.get("/", c.getReviews);
r.post("/", verifyToken, c.addReview);
export default r;
