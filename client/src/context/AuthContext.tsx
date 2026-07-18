"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, saveToken, destroyToken, decodeJWT, isTokenExpired } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "traveler" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password?: string, role?: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        const decoded = decodeJWT(token);
        if (decoded) {
          setUser({
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.email.split("@")[0], // basic temporary name until database resolves it
          });
        }

        try {
          const response = await apiFetch<{ success: boolean; user: User }>("/api/users/me");
          if (response.success && response.user) {
            setUser(response.user);
          }
        } catch (error) {
          console.error("Failed to fetch fresh user profile:", error);
          // If token fetch fails due to backend expired status, destroy the token
          destroyToken();
          setUser(null);
        }
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        saveToken(data.token);
        setUser(data.user);
        router.push("/");
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string, role: string = "traveler") => {
    setLoading(true);
    try {
      await apiFetch<{ success: boolean }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      if (password) {
        await login(email, password);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; token: string; user: User }>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });

      if (data.token) {
        saveToken(data.token);
        setUser(data.user);
        router.push("/");
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    destroyToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
