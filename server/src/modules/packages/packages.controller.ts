import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { packagesService } from "./packages.service";
import { JWTPayload } from "../auth/auth.types";

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { search, location, minPrice, maxPrice, minRating, sortBy, limit, page, ownerAdminId } = req.query;

    const filters = {
      search: search ? String(search) : undefined,
      location: location ? String(location) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      sortBy: sortBy as "price_asc" | "price_desc" | "rating" | "newest" | undefined,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      ownerAdminId: ownerAdminId ? String(ownerAdminId) : undefined,
    };

    const result = await packagesService.findAll(filters);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await packagesService.findById(id);
    if (!pkg) {
      res.status(404).json({ error: { message: "Package not found" } });
      return;
    }
    res.status(200).json(pkg);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function create(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { title, shortDescription, fullDescription, price, duration, location, images, rating } = authReq.body;

    if (!authReq.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    if (!title || !price || !location) {
      res.status(400).json({ error: { message: "Title, price, and location are required" } });
      return;
    }

    const newPkg = await packagesService.create({
      title,
      shortDescription: shortDescription || "",
      fullDescription: fullDescription || "",
      price: Number(price),
      duration: duration || "1 Day / Same Day",
      location,
      images: Array.isArray(images) ? images : [],
      rating: rating ? Number(rating) : 5.0,
      ownerAdminId: new ObjectId(authReq.user.userId),
    });

    res.status(201).json(newPkg);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = authReq.params;

    if (!authReq.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const existing = await packagesService.findById(id);
    if (!existing) {
      res.status(404).json({ error: { message: "Package not found" } });
      return;
    }

    if (existing.ownerAdminId.toString() !== authReq.user.userId) {
      res.status(403).json({ error: { message: "Forbidden: You do not own this package" } });
      return;
    }

    const updated = await packagesService.update(id, authReq.body);
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

async function deleteById(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = authReq.params;

    if (!authReq.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const existing = await packagesService.findById(id);
    if (!existing) {
      res.status(404).json({ error: { message: "Package not found" } });
      return;
    }

    if (existing.ownerAdminId.toString() !== authReq.user.userId) {
      res.status(403).json({ error: { message: "Forbidden: You do not own this package" } });
      return;
    }

    await packagesService.deleteById(id);
    res.status(200).json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: { message } });
  }
}

export const packagesController = {
  getAll,
  getById,
  create,
  update,
  deleteById,
};
