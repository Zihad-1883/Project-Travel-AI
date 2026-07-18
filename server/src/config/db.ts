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

    db = client.db("travel-ai");
    
    // Create indexes for location, price, and rating to optimize filters
    try {
      await db.collection("packages").createIndex({ location: 1 });
      await db.collection("packages").createIndex({ price: 1 });
      await db.collection("packages").createIndex({ rating: -1 });
      console.log("Database indexes for packages created/verified successfully");
    } catch (indexError) {
      console.error("Warning: Failed to create package collection indexes:", indexError);
    }

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
