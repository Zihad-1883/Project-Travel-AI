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

export const userController = {
  getMe,
};
