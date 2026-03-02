import { createContext, createElement, useContext, useState } from "react";
import type { ReactNode } from "react";

export type AuthRole = "admin" | "user" | "guest";

interface AuthContextType {
  role: AuthRole;
  isAdmin: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  userAccountNumber: string | null;
  login: (
    accountNumber: string,
    password: string,
    loginType: AuthRole,
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AuthRole>(() => {
    const saved = localStorage.getItem("auth_role");
    return (saved as AuthRole) || "guest";
  });

  const [userAccountNumber, setUserAccountNumber] = useState<string | null>(
    () => {
      return localStorage.getItem("auth_account_number");
    },
  );

  const isAuthenticated = role !== "guest";
  const isAdmin = role === "admin";
  const isUser = role === "user";

  const login = async (
    accountNumber: string,
    password: string,
    loginType: AuthRole,
  ): Promise<boolean> => {
    if (loginType === "admin") {
      // Simple admin login: username=admin, password=admin
      if (
        accountNumber.trim().toLowerCase() === "admin" &&
        password.trim() === "admin"
      ) {
        setRole("admin");
        localStorage.setItem("auth_role", "admin");
        return true;
      }
      return false;
    }
    if (loginType === "user") {
      if (!accountNumber.trim()) return false;
      // User login: account number as both username and password
      if (accountNumber.trim() !== password.trim()) return false;
      setRole("user");
      setUserAccountNumber(accountNumber.trim());
      localStorage.setItem("auth_role", "user");
      localStorage.setItem("auth_account_number", accountNumber.trim());
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole("guest");
    setUserAccountNumber(null);
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_account_number");
  };

  const value: AuthContextType = {
    role,
    isAdmin,
    isUser,
    isAuthenticated,
    userAccountNumber,
    login,
    logout,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
