import { ObjectId, Filter } from "mongodb";
import { getDb } from "../../config/db";
import { Package } from "./packages.types";

export interface PackageFilters {
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  limit?: number;
  page?: number;
  ownerAdminId?: string;
}

export interface PaginatedPackages {
  packages: Package[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const getCollection = () => {
  return getDb().collection<Package>("packages");
};

async function findById(id: string): Promise<Package | null> {
  if (!ObjectId.isValid(id)) return null;
  return getCollection().findOne({ _id: new ObjectId(id) });
}

async function findAll(filters: PackageFilters): Promise<PaginatedPackages> {
  const query: Filter<Package> = {};

  if (filters.ownerAdminId && ObjectId.isValid(filters.ownerAdminId)) {
    query.ownerAdminId = new ObjectId(filters.ownerAdminId);
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { location: { $regex: filters.search, $options: "i" } },
      { shortDescription: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.location) {
    query.location = { $regex: filters.location, $options: "i" };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceQuery: Record<string, number> = {};
    if (filters.minPrice !== undefined) priceQuery.$gte = Number(filters.minPrice);
    if (filters.maxPrice !== undefined) priceQuery.$lte = Number(filters.maxPrice);
    query.price = priceQuery;
  }

  if (filters.minRating !== undefined) {
    query.rating = { $gte: Number(filters.minRating) };
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters.sortBy === "price_asc") {
    sort = { price: 1 };
  } else if (filters.sortBy === "price_desc") {
    sort = { price: -1 };
  } else if (filters.sortBy === "rating") {
    sort = { rating: -1 };
  } else if (filters.sortBy === "newest") {
    sort = { createdAt: -1 };
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 8;
  const skip = (page - 1) * limit;

  const total = await getCollection().countDocuments(query);
  const packages = await getCollection()
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    packages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function create(packageData: Omit<Package, "_id" | "createdAt">): Promise<Package> {
  const newPackage: Package = {
    ...packageData,
    price: Number(packageData.price),
    rating: Number(packageData.rating) || 5.0,
    createdAt: new Date(),
  };

  const result = await getCollection().insertOne(newPackage);
  newPackage._id = result.insertedId;
  return newPackage;
}

async function update(
  id: string,
  packageData: Partial<Omit<Package, "_id" | "createdAt">>
): Promise<Package | null> {
  if (!ObjectId.isValid(id)) return null;

  const updateFields: Record<string, unknown> = { ...packageData };
  if (updateFields.price !== undefined) updateFields.price = Number(updateFields.price);
  if (updateFields.rating !== undefined) updateFields.rating = Number(updateFields.rating);
  if (updateFields.ownerAdminId) updateFields.ownerAdminId = new ObjectId(updateFields.ownerAdminId as string);

  const result = await getCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields as Partial<Package> },
    { returnDocument: "after" }
  );

  return result;
}

async function deleteById(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await getCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export const packagesService = {
  findById,
  findAll,
  create,
  update,
  deleteById,
};
