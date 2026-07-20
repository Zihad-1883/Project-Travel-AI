import { Request, Response } from "express";
import { recommendationService, TravelPreferences } from "./recommendation.service";
import { JWTPayload } from "../auth/auth.types";

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

async function getRecommendations(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.user) {
    res.status(401).json({ error: { message: "Unauthorized - please log in" } });
    return;
  }

  try {
    const preferences: TravelPreferences = authReq.body.preferences || {};
    
    // Call the context-aware recommendation service
    const recommendations = await recommendationService.getRecommendations(
      authReq.user.userId,
      preferences
    );

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

export const aiController = {
  getRecommendations,
};
