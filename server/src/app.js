import express from "express";
import cors from "cors";
import morgan from "morgan";
import api from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const origins = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
// Flutter (mobile) app er request e Origin header thake na, tai seta allow
app.use(cors({ origin: (origin, cb) => cb(null, !origin || origins.length === 0 || origins.includes(origin)) }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true })); // SSLCommerz form-POST er jonno
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => res.json({ name: "Barakah Books API", docs: "/api/health" }));
app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

export default app;
