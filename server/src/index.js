import app from "./app.js";
import { connectDB, closeDB } from "./config/db.js";
import "./config/firebase.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();

  // '0.0.0.0' মানে computer এর বাইরে থেকেও (ফোন, WiFi) server এ পৌঁছানো যাবে
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Barakah Books API running on port ${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await closeDB();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (err) {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
}