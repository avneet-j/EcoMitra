import "dotenv/config";
import { getDb } from "../lib/mongodb.js";

const db = await getDb();

const now = new Date();

const data = [
  { userId: "demo-user-1", block: "Block A", category: "electricity", value: 6.2, unit: " kWh", date: new Date(now - 6 * 86400000) },
  { userId: "demo-user-1", block: "Block A", category: "water", value: 180, unit: " L", date: new Date(now - 5 * 86400000) },
  { userId: "demo-user-1", block: "Block A", category: "electricity", value: 8.1, unit: " kWh", date: new Date(now - 4 * 86400000) },
  { userId: "demo-user-1", block: "Block A", category: "water", value: 240, unit: " L", date: new Date(now - 3 * 86400000) },
  { userId: "demo-user-1", block: "Block A", category: "waste", value: 4.5, unit: " kg", date: new Date(now - 2 * 86400000) },
  { userId: "demo-user-1", block: "Block A", category: "electricity", value: 7.8, unit: " kWh", date: new Date(now - 1 * 86400000) },
];

await db.collection("usage_logs").deleteMany({ userId: "demo-user-1" });
await db.collection("usage_logs").insertMany(data);

console.log(`Inserted ${data.length} demo usage records.`);
process.exit(0);