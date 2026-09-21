import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "ecomitra";

if (!uri) {
  console.warn("[mongodb] MONGODB_URI is not set — DB calls will fail.");
}

// Reuse the client across warm serverless invocations (Vercel best practice).
let cachedClient = globalThis._ecomitraMongoClient;

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
    globalThis._ecomitraMongoClient = cachedClient;
  }
  return cachedClient;
}

export async function getDb() {
  const client = await getClient();
  return client.db(dbName);
}
