import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface Env {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  GROQ_API_KEY?: string;
  CLIENT_URL: string;
}

const getEnv = (): Env => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "CRITICAL CONFIGURATION ERROR: MONGODB_URI is not defined in the environment variables!"
    );
  }

  // Provide sensible defaults for local development, fallback checks
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const NODE_ENV = process.env.NODE_ENV || "development";
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_jwt_secret_change_me_in_production";
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

  return {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    CLIENT_URL,
  };
};

export const env = getEnv();
