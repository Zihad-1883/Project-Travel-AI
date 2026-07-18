import { ObjectId } from "mongodb";
import { getDb } from "../../config/db";
import { User } from "./user.types";

const getCollection = () => {
  return getDb().collection<User>("users");
};

async function findById(id: string): Promise<User | null> {
  if (!ObjectId.isValid(id)) return null;
  return getCollection().findOne({ _id: new ObjectId(id) });
}

async function findByEmail(email: string): Promise<User | null> {
  return getCollection().findOne({ email: email.toLowerCase() });
}

async function findByGoogleId(googleId: string): Promise<User | null> {
  return getCollection().findOne({ googleId });
}

async function create(user: Omit<User, "_id" | "createdAt">): Promise<User> {
  const newUser: User = {
    ...user,
    email: user.email.toLowerCase(),
    createdAt: new Date(),
  };
  const result = await getCollection().insertOne(newUser);
  newUser._id = result.insertedId;
  return newUser;
}

export const userService = {
  findById,
  findByEmail,
  findByGoogleId,
  create,
};
