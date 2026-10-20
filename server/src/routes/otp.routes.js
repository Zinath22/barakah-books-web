import { Router } from "express";
import * as c from "../controllers/otp.controller.js";

const r = Router();
r.post("/send", c.sendOtp);
r.post("/verify", c.verifyOtp);
export default r;
