import { ObjectId } from "mongodb";

export interface Package {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  duration: string;
  location: string;
  images: string[];
  rating: number;
  ownerAdminId: ObjectId;
  createdAt: Date;
}
