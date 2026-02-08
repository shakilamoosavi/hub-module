"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  birthdate: string;
  walletUSD: number;
};

export type RegisterPayload = Omit<UserProfile, "walletUSD"> & { password?: string };

export type AuthContextValue = {
  user: UserProfile | null;
  login: (profile: UserProfile, jwt?: string) => void;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (payload: { email?: string; phone?: string }) => Promise<void>;
  changePassword: (payload: { current: string; next: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "hub-module-auth";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

const defaultUser: UserProfile = {
  firstName: "Ava",
  lastName: "Karimi",
  email: "ava@example.com",
  phone: "+1 555 111 2222",
  country: "United States",
  city: "Austin",
  birthdate: "1994-04-17",
  walletUSD: 2750,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Accept optional jwt as second argument
  const login = (profile: UserProfile, jwt?: string) => {
    setUser(profile);
    if (jwt) {
      document.cookie = `jwt=${jwt}; path=/; secure; samesite=strict`;
    }
  };

  const register = async (payload: RegisterPayload) => {
    const newUser: UserProfile = { ...payload, walletUSD: 1500 };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    // Remove jwt cookie
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  };

  const requestPasswordReset = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const changePassword = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const value = useMemo(
    () => ({ user, login, register, logout, requestPasswordReset, changePassword }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
