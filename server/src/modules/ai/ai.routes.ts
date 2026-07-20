import { Router } from "express";
import { aiController } from "./ai.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Endpoint for context-aware AI recommendations
router.post("/recommend", authMiddleware, asyncHandler(aiController.getRecommendations));

export default router;
