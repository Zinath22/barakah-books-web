import { Router } from "express";
import * as c from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const r = Router();
r.use(verifyToken);
r.post("/save", c.saveUser);
r.get("/me", c.getMe);
r.patch("/me", c.updateMe);
r.get("/", verifyAdmin, c.getUsers);
r.patch("/:id/make-admin", verifyAdmin, c.makeAdmin);
r.delete("/:id", verifyAdmin, c.deleteUser);
export default r;
