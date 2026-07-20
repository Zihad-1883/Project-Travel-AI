import { Router } from "express";
import { aiController } from "./ai.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Endpoint for context-aware AI recommendations
router.post("/recommend", authMiddleware, asyncHandler(aiController.getRecommendations));

// Endpoints for real-time streaming AI chatbot concierge
router.post("/chat", authMiddleware, aiController.streamChat);
router.get("/chat/history", authMiddleware, asyncHandler(aiController.getChatHistory));
router.delete("/chat/history", authMiddleware, asyncHandler(aiController.clearChatHistory));

export default router;

