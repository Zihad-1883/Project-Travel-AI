import { ObjectId } from "mongodb";
import { Package } from "../packages/packages.types";

export interface Booking {
  _id?: ObjectId;
  userId: ObjectId;
  packageId: ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  packageDetails?: Package;
  userDetails?: {
    name: string;
    email: string;
  };
}
