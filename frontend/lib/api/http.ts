import axios, { AxiosError, type AxiosInstance } from "axios";

import { getAccessToken } from "@/lib/auth";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
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
    return {
      status: axiosError.response?.status ?? 0,
      message: axiosError.response?.data?.message ?? axiosError.message ?? "Request failed",
      details: axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }

  return { status: 0, message: "Unknown error" };
}
