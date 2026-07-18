import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

const router = Router();

// Authenticated routes
router.post("/", authMiddleware, bookingsController.create);
router.get("/", authMiddleware, bookingsController.getList);

// Admin-only route
router.patch("/:id/status", authMiddleware, roleMiddleware(["admin"]), bookingsController.updateStatus);

export default router;
