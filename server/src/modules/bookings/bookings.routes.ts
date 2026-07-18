import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Authenticated routes
router.post("/", authMiddleware, bookingsController.create);
router.get("/", authMiddleware, bookingsController.getList);

// Authenticated users route (admin can edit any status, user can only cancel their own)
router.patch("/:id/status", authMiddleware, bookingsController.updateStatus);

export default router;
