import { ObjectId } from "mongodb";

export type UserRole = "traveler" | "admin";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash?: string; // Optional if logged in via Google OAuth
  role: UserRole;
  googleId?: string;
  createdAt: Date;
}

export interface UserInteraction {
  _id?: ObjectId;
  userId: ObjectId;
  packageId: ObjectId;
  type: "view" | "save";
  createdAt: Date;
}
