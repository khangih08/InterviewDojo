"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearAccessToken,
  clearUser,
  getAccessToken,
  getUser,
  saveAccessToken,
  saveUser,
} from "@/lib/auth";
import { login as loginApi, register as registerApi } from "@/lib/api/auth";
import type { AuthRegisterRequest, User } from "@/lib/api/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  login: (input: {
    email: string;
    password: string;
    remember?: boolean;
  }) => Promise<void>;
  register: (input: AuthRegisterRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(getUser<User>());
    setToken(getAccessToken());
    setHydrated(true);
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string; remember?: boolean }) => {
      const response = await loginApi({
        email: input.email,
        password: input.password,
      });

      saveAccessToken(response.token, input.remember);
      saveUser(response.user);
      setToken(response.token);
      setUser(response.user);
    },
    []
  );

  const register = useCallback(async (input: AuthRegisterRequest) => {
    await registerApi(input);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    clearUser();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      hydrated,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, hydrated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
