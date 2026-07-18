import { Router } from "express";
import { packagesController } from "./packages.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

const router = Router();

// Public routes for listing and viewing details
router.get("/", packagesController.getAll);
router.get("/:id", packagesController.getById);

// Admin-only routes for package modification and deletion
router.post("/", authMiddleware, roleMiddleware(["admin"]), packagesController.create);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), packagesController.update);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), packagesController.deleteById);

export default router;
