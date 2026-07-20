import { Request, Response } from "express";
import { userService } from "./user.service";

async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: { message: "Unauthorized" },
    });
    return;
  }

  const user = await userService.findById(req.user.userId);
  if (!user) {
    res.status(404).json({
      error: { message: "User not found" },
    });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

async function postInteraction(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const { packageId, type } = req.body;
  if (!packageId || !type || (type !== "view" && type !== "save")) {
    res.status(400).json({ error: { message: "Missing or invalid packageId or type (view|save)" } });
    return;
  }

  try {
    const interaction = await userService.logInteraction(req.user.userId, packageId, type);
    res.status(201).json({ success: true, interaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function getInteractions(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  try {
    const interactions = await userService.getInteractionsForUser(req.user.userId);
    res.status(200).json({ success: true, interactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

export const userController = {
  getMe,
  postInteraction,
  getInteractions,
};
