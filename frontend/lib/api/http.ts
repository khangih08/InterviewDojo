import axios, { AxiosError, type AxiosInstance } from "axios";

import { getAccessToken } from "@/lib/auth";

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

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

export const http = createHttpClient();

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

  return { status: 0, message: "Unknown error" };
}
