import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/google", asyncHandler(authController.googleLogin));

export default router;
