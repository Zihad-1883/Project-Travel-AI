import { Request, Response } from "express";
import { authService } from "./auth.service";

async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  if (!name || !email) {
    res.status(400).json({
      error: { message: "Name and email are required" }
    });
    return;
  }

  try {
    // Normal registration always defaults strictly to "traveler" role for security
    const user = await authService.register(name, email, password, "traveler");
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({
      error: { message: errorMessage }
    });
  }
}

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: { message: "Email and password are required" }
    });
    return;
  }

  try {
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({
      error: { message: errorMessage }
    });
  }
}

async function googleLogin(req: Request, res: Response): Promise<void> {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({
      error: { message: "Google ID Token is required" }
    });
    return;
  }

  try {
    const result = await authService.googleLogin(idToken);
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({
      error: { message: errorMessage }
    });
  }
}

export const authController = {
  register,
  login,
  googleLogin,
};
