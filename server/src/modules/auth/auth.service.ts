import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userService } from "../user/user.service";
import { JWTPayload, AuthResponse } from "./auth.types";
import { env } from "../../config/env";
import { User, UserRole } from "../user/user.types";
import { getDb } from "../../config/db";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user._id!.toString(),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

async function register(
  name: string,
  email: string,
  password?: string,
  role: UserRole = "traveler"
): Promise<User> {
  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  let passwordHash: string | undefined;
  if (password) {
    passwordHash = await hashPassword(password);
  }

  return userService.create({
    name,
    email,
    passwordHash,
    role,
  });
}

async function login(email: string, password?: string): Promise<AuthResponse> {
  const user = await userService.findByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new Error("This account is configured for Google Login. Please sign in with Google.");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    success: true,
    token,
    user: {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function googleLogin(idToken: string): Promise<AuthResponse> {
  let googleUser: { email: string; name: string; sub: string };

  try {
    // support test tokens for backend/frontend testing and continuous integration
    if (idToken.startsWith("mock_token_")) {
      const parts = idToken.split("_");
      const email = parts[2] || "mockuser@gmail.com";
      const name = parts[3] || "Mock User";
      const sub = parts[4] || "mock_google_id_12345";
      googleUser = { email, name, sub };
    } else {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new Error("Invalid Google ID Token");
      }
      const data = await response.json();
      if (!data.email || !data.sub) {
        throw new Error("Failed to get Google profile info from token");
      }
      googleUser = {
        email: data.email,
        name: data.name || data.email.split("@")[0],
        sub: data.sub,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Google token verification failed:", error);
    throw new Error(`Google authentication failed: ${errorMessage}`);
  }

  let user = await userService.findByGoogleId(googleUser.sub);
  if (!user) {
    user = await userService.findByEmail(googleUser.email);
    if (user) {
      // Link googleId to existing user
      const collection = getDb().collection<User>("users");
      await collection.updateOne({ _id: user._id }, { $set: { googleId: googleUser.sub } });
      user.googleId = googleUser.sub;
    } else {
      // Create new user (defaulting to role "traveler")
      user = await userService.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        role: "traveler",
      });
    }
  }

  const token = generateToken(user);

  return {
    success: true,
    token,
    user: {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export const authService = {
  hashPassword,
  comparePassword,
  generateToken,
  register,
  login,
  googleLogin,
};
