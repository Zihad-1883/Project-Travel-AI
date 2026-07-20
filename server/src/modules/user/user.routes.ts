import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/me", authMiddleware, asyncHandler(userController.getMe));
router.post("/interactions", authMiddleware, asyncHandler(userController.postInteraction));
router.get("/interactions", authMiddleware, asyncHandler(userController.getInteractions));

export default router;
