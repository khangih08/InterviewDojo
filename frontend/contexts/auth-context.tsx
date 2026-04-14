"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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

type AuthSnapshot = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
};

const SERVER_AUTH_SNAPSHOT: AuthSnapshot = {
  user: null,
  token: null,
  hydrated: false,
};

let cachedUserRaw: string | null | undefined;
let cachedToken: string | null | undefined;
let cachedSnapshot: AuthSnapshot | undefined;

function subscribeAuthStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}

function getClientAuthSnapshot(): AuthSnapshot {
  const userRaw =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("idc_user");
  const token = getAccessToken();

  if (
    cachedSnapshot &&
    cachedUserRaw === userRaw &&
    cachedToken === token
  ) {
    return cachedSnapshot;
  }

  cachedUserRaw = userRaw;
  cachedToken = token;
  cachedSnapshot = {
    user: userRaw ? (JSON.parse(userRaw) as User) : null,
    token,
    hydrated: true,
  };

  return cachedSnapshot;
}

function getServerAuthSnapshot(): AuthSnapshot {
  return SERVER_AUTH_SNAPSHOT;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authSnapshot = useSyncExternalStore(
    subscribeAuthStore,
    getClientAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { user, token, hydrated } = authSnapshot;

  const login = useCallback(
    async (input: { email: string; password: string; remember?: boolean }) => {
      const response = await loginApi({
        email: input.email,
        password: input.password,
      });

      saveAccessToken(response.token, input.remember);
      saveUser(response.user);
      window.dispatchEvent(new Event("storage"));
    },
    [],
  );

  const register = useCallback(async (input: AuthRegisterRequest) => {
    await registerApi(input);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    clearUser();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
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
    [user, token, hydrated, login, register, logout],
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
