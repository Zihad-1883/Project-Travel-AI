import { ObjectId } from "mongodb";
import { getDb } from "../../config/db";
import { User, UserInteraction } from "./user.types";

const getCollection = () => {
  return getDb().collection<User>("users");
};

const getInteractionCollection = () => {
  return getDb().collection<UserInteraction>("userInteractions");
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

async function logInteraction(userId: string, packageId: string, type: "view" | "save"): Promise<UserInteraction> {
  const interaction: UserInteraction = {
    userId: new ObjectId(userId),
    packageId: new ObjectId(packageId),
    type,
    createdAt: new Date(),
  };
  await getInteractionCollection().insertOne(interaction);
  return interaction;
}

async function getInteractionsForUser(userId: string): Promise<UserInteraction[]> {
  if (!ObjectId.isValid(userId)) return [];
  return getInteractionCollection()
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export const userService = {
  findById,
  findByEmail,
  findByGoogleId,
  create,
  logInteraction,
  getInteractionsForUser,
};
