import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { env } from "./config/env";

const app = express();

// Standard middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
