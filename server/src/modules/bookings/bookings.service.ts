import { ObjectId } from "mongodb";
import { getDb } from "../../config/db";
import { Booking } from "./bookings.types";

const getCollection = () => {
  return getDb().collection<Booking>("bookings");
};

async function create(userId: string, packageId: string): Promise<Booking> {
  const newBooking: Booking = {
    userId: new ObjectId(userId),
    packageId: new ObjectId(packageId),
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await getCollection().insertOne(newBooking);
  newBooking._id = result.insertedId;
  return newBooking;
}

async function findTravelerBookings(userId: string): Promise<Booking[]> {
  return getCollection()
    .aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "packageDetails",
        },
      },
      {
        $unwind: {
          path: "$packageDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray() as Promise<Booking[]>;
}

async function findAllBookings(): Promise<Booking[]> {
  return getCollection()
    .aggregate([
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "packageDetails",
        },
      },
      {
        $unwind: {
          path: "$packageDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          packageId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          packageDetails: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray() as Promise<Booking[]>;
}

async function updateStatus(id: string, status: "approved" | "rejected" | "cancelled"): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;
  const result = await getCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  return result;
}

async function findById(id: string): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;
  return getCollection().findOne({ _id: new ObjectId(id) });
}

async function findActiveBooking(userId: string, packageId: string): Promise<Booking | null> {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(packageId)) return null;
  return getCollection().findOne({
    userId: new ObjectId(userId),
    packageId: new ObjectId(packageId),
    status: { $in: ["pending", "approved"] },
  });
}

export const bookingsService = {
  create,
  findTravelerBookings,
  findAllBookings,
  updateStatus,
  findById,
  findActiveBooking,
};
