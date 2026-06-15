"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  clearAuthTokens,
  clearUser,
  getAccessToken,
  getUser,
  saveAuthTokens,
  saveUser,
} from "@/lib/auth";
import {
  login as loginApi,
  logoutApi,
  register as registerApi,
} from "@/lib/api/auth";
import type { AuthRegisterRequest, User } from "@/lib/api/types"; // Đồng bộ Enum JobRole chuẩn từ types.ts
import { http } from "@/lib/api/http";

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
  refreshUser: () => Promise<void>; 
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
  const handleStorageChange = () => {
    cachedUserRaw = undefined;
    cachedToken = undefined;
    cachedSnapshot = undefined;
    onStoreChange();
  };
  
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("authStorageChange", handleStorageChange);
  
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("authStorageChange", handleStorageChange);
  };
}

function getClientAuthSnapshot(): AuthSnapshot {
  const user = getUser<User>();
  const userRaw = user ? JSON.stringify(user) : null;
  const token = getAccessToken();

  if (cachedSnapshot && cachedUserRaw === userRaw && cachedToken === token) {
    return cachedSnapshot;
  }

  cachedUserRaw = userRaw;
  cachedToken = token;
  cachedSnapshot = {
    user,
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

      saveAuthTokens({
        accessToken: response.accessToken ?? response.token,
        refreshToken: response.refreshToken,
        remember: input.remember,
      });
      saveUser(response.user, input.remember);
    },
    [],
  );

  const register = useCallback(async (input: AuthRegisterRequest) => {
    await registerApi(input);
  }, []);

  const logout = useCallback(() => {
    void logoutApi();
    clearAuthTokens();
    clearUser();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event('authStorageChange'));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await http.get<User>('/user/me'); 
      const updatedUser = response.data; 
      
      if (updatedUser) {
        saveUser(updatedUser); 
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event('authStorageChange'));
        }
      }
    } catch (error) {
      console.error("Failed to refresh user profile package:", error);
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
      refreshUser, 
    }),
    [user, token, hydrated, login, register, logout, refreshUser],
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