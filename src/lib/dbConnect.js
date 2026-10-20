

import dns from "node:dns";

// কিছু ISP/WiFi তে mongodb+srv এর DNS খোঁজ ব্যর্থ হয় (querySrv ECONNREFUSED)।
// তাই Google আর Cloudflare এর DNS ব্যবহার করা হচ্ছে।
// নিজের network এর DNS ব্যবহার করতে চাইলে .env এ DNS_SERVERS=system দিন।
if (process.env.DNS_SERVERS !== "system") {
  dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map((s) => s.trim()));
}

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("Please add MONGODB_URI in .env.local");
}

// ⚠️ global cache fix for Next.js hot reload
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

// ✅ server-only DB connect function
export const dbConnect = async () => {
  const client = await clientPromise;
  return client.db(dbName);
};

// optional helper
export const collections = {
  USERS: "users",
};