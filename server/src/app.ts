import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { env } from "./config/env";
import apiRouter from "./routes";

const app = express();

// Standard middleware supporting local development and deployed frontend URLs
const allowedOrigins = [
  env.CLIENT_URL,
  "https://project-travel-ai.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.startsWith("http://localhost:") || 
                        origin.endsWith(".vercel.app");
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Type", "Transfer-Encoding"],
  })
);
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Travel AI API",
    healthCheck: "/api/health",
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Mounted module routes
app.use("/api", apiRouter);

// Error handling middleware
app.use(errorHandler);

export default app;
