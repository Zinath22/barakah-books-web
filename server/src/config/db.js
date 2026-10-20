import dns from "node:dns";

// কিছু ISP/WiFi তে mongodb+srv এর DNS খোঁজ ব্যর্থ হয় (querySrv ECONNREFUSED)।
// তাই Google আর Cloudflare এর DNS ব্যবহার করা হচ্ছে।
// নিজের network এর DNS ব্যবহার করতে চাইলে .env এ DNS_SERVERS=system দিন।
if (process.env.DNS_SERVERS !== "system") {
  dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map((s) => s.trim()));
}

import { MongoClient } from "mongodb";

let client;
let db;

// Server start howar somoy ekbar connect hoy, tarpor same connection reuse hoy
export async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing in .env");

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.DB_NAME);

  console.log(`✅ MongoDB connected (${db.databaseName})`);
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

export const col = (name) => getDB().collection(name);

export async function closeDB() {
  if (client) await client.close();
}
