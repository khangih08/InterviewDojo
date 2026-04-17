import axios, { AxiosError, type AxiosInstance } from "axios";
import {
  clearAuthTokens,
  clearUser,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
  saveUser,
} from "@/lib/auth";
import type { AuthLoginResponse } from "@/lib/api/types";
import { toastError } from "@/lib/toast";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

function normalizeApiMessage(message: unknown, fallback: string) {
  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
}

export function createHttpClient(): AxiosInstance {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  const instance = axios.create({
    baseURL,
    timeout: 20_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interceptor để tự động đính kèm JWT Token vào mọi request
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const response = await axios.post<AuthLoginResponse>(
      `${baseURL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );

    const payload = response.data;
    const accessToken = payload.accessToken ?? payload.token;
    if (!accessToken) return null;

    saveAuthTokens({
      accessToken,
      refreshToken: payload.refreshToken,
    });

    if (payload.user) {
      saveUser(payload.user);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }

    return accessToken;
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalConfig = (error.config ?? {}) as AxiosError["config"] & {
        _retry?: boolean;
        skipErrorToast?: boolean;
      };

      const status = error.response?.status;
      const requestUrl = String(originalConfig?.url ?? "");
      const isRefreshCall = requestUrl.includes("/auth/refresh");

      if (status === 401 && !originalConfig?._retry && !isRefreshCall) {
        originalConfig._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
              refreshPromise = null;
            });
          }

          const newAccessToken = await refreshPromise;
          if (newAccessToken && originalConfig) {
            originalConfig.headers = originalConfig.headers ?? {};
            originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalConfig);
          }
        } catch {
          // If refresh fails, fall through and clear session below.
        }

        clearAuthTokens();
        clearUser();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
        }
      }

      const shouldSkipToast =
        originalConfig?.skipErrorToast ||
        originalConfig?.headers?.["x-skip-error-toast"] === "1" ||
        error.code === "ERR_CANCELED";

      if (!shouldSkipToast) {
        const apiError = toApiError(error);
        toastError(apiError.message);
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const http = createHttpClient();

/**
 * Hàm chuyển đổi lỗi từ Axios sang định dạng chuẩn của ứng dụng
 * Giúp hiển thị thông báo lỗi thân thiện hơn cho người dùng
 */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const fallbackMessage =
      axiosError.code === "ERR_NETWORK"
        ? "Cannot reach the server. Make sure the backend is running."
        : axiosError.message ?? "Request failed";

    return {
      status: axiosError.response?.status ?? 0,
      message: normalizeApiMessage(
        axiosError.response?.data?.message,
        fallbackMessage
      ),
      details: axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }

  return { status: 0, message: "Lỗi không xác định" };
}