import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(env.MONGODB_URI, {
      // Direct raw driver options
    });

    await client.connect();
    console.log("Successfully connected to MongoDB database");

    // Retrieve database name from URI or use a default
    // URI usually has /dbName?options. We can find the dbName or let mongodb use its default (e.g. travel-ai)
    db = client.db("travel-ai");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Disconnected from MongoDB");
  }
}
