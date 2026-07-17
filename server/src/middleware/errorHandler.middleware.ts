import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  
  // Log server-side only to avoid leaking details
  console.error(`[Error] [Code: ${errorCode}] status: ${statusCode} - message: ${err.message}`);
  if (err.stack && env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Consistent error response shape:
  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? "An unexpected server error occurred." : err.message,
      code: errorCode,
    },
  });
}
