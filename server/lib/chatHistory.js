import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db(); // uses the database name from your URI
  }
  return db;
}

export async function saveChat(sessionId, userMessage, botReply) {
  const database = await getDB();
  await database.collection("conversations").insertOne({
    sessionId,
    userMessage,
    botReply,
    timestamp: new Date(),
  });
}

export async function getChatHistory(sessionId, limit = 20) {
  const database = await getDB();
  return database
    .collection("conversations")
    .find({ sessionId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}
