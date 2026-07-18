import { Request, Response, NextFunction } from "express";
import { UserRole } from "../modules/user/user.types";

export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { message: "Unauthorized: User not authenticated." },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: { message: "Forbidden: You do not have permission for this action." },
      });
      return;
    }

    next();
  };
}
