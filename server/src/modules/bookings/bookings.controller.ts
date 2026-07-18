import { Request, Response } from "express";
import { bookingsService } from "./bookings.service";
import { JWTPayload } from "../auth/auth.types";

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

async function create(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { packageId } = authReq.body;

    if (!authReq.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    if (!packageId) {
      res.status(400).json({ error: { message: "Package ID is required" } });
      return;
    }

    const booking = await bookingsService.create(authReq.user.userId, packageId);
    res.status(201).json(booking);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function getList(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    let bookings;
    if (authReq.user.role === "admin") {
      bookings = await bookingsService.findAllBookings();
    } else {
      bookings = await bookingsService.findTravelerBookings(authReq.user.userId);
    }

    res.status(200).json(bookings);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = authReq.params;
    const { status } = authReq.body;

    if (!authReq.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    if (authReq.user.role !== "admin") {
      res.status(403).json({ error: { message: "Forbidden: Admins only" } });
      return;
    }

    if (status !== "approved" && status !== "rejected") {
      res.status(400).json({ error: { message: "Status must be either 'approved' or 'rejected'" } });
      return;
    }

    const updated = await bookingsService.updateStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: { message: "Booking not found" } });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

export const bookingsController = {
  create,
  getList,
  updateStatus,
};
