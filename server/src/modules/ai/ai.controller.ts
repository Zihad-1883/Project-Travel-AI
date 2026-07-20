import { Request, Response } from "express";
import { recommendationService, TravelPreferences } from "./recommendation.service";
import { chatService } from "./chat.service";
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

async function streamChat(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: { message: "Unauthorized - please log in" } });
    return;
  }

  const { message } = authReq.body;
  if (!message) {
    res.status(400).json({ error: { message: "Message content cannot be blank" } });
    return;
  }

  // Set HTTP headers for text chunk streaming
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering on reverse proxies/Nginx
  res.flushHeaders();

  try {
    await chatService.handleChatStream(
      authReq.user.userId,
      message,
      (chunk) => {
        res.write(chunk);
      },
      () => {
        res.end();
      },
      (err) => {
        console.error("Stream compilation error:", err);
        res.write(`\n[ERROR: ${err instanceof Error ? err.message : "Failed to generate stream"}]`);
        res.end();
      }
    );
  } catch (error) {
    console.error("Chat controller failed:", error);
    res.status(500).json({ error: { message: "Failed to initiate chat stream" } });
  }
}

async function getChatHistory(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  try {
    const history = await chatService.getHistory(authReq.user.userId);
    res.status(200).json({
      success: true,
      history: history.map((h) => ({
        role: h.role,
        content: h.content,
        createdAt: h.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get chat history controller failed:", error);
    res.status(500).json({ error: { message: "Failed to fetch chat logs" } });
  }
}

async function clearChatHistory(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  try {
    await chatService.clearHistory(authReq.user.userId);
    res.status(200).json({
      success: true,
      message: "Conversation history cleared successfully",
    });
  } catch (error) {
    console.error("Clear chat history controller failed:", error);
    res.status(500).json({ error: { message: "Failed to reset chat logs" } });
  }
}

export const aiController = {
  getRecommendations,
  streamChat,
  getChatHistory,
  clearChatHistory,
};

