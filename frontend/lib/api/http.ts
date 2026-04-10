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
  // Lấy URL từ biến môi trường của bạn (NEXT_PUBLIC_API_BASE_URL)
  // Nếu không có, mặc định trỏ về cổng 3001 (Backend NestJS)
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

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
    
    // Xử lý lỗi mất kết nối (Backend chưa bật hoặc sai URL)
    if (axiosError.code === "ERR_NETWORK" || !axiosError.response) {
      return {
        status: 0,
        message: "Không thể kết nối đến máy chủ. Vui lòng đảm bảo Backend đang chạy tại cổng 3001.",
        details: axiosError.code,
      };
    }

    const fallbackMessage = axiosError.message ?? "Yêu cầu thất bại";

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