import { Router } from "express";
import * as c from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const r = Router();
r.post("/init", verifyToken, c.initPayment);
r.get("/status/:tranId", verifyToken, c.paymentStatus);

// SSLCommerz callbacks (form-urlencoded POST, token chara)
r.post("/success/:tranId", c.paymentSuccess);
r.post("/fail/:tranId", c.paymentFail);
r.post("/cancel/:tranId", c.paymentCancel);
r.post("/ipn", c.paymentIpn);
export default r;
