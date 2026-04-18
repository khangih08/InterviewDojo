import {
  mockLogin,
  mockForgotPassword,
  mockResetPassword,
  mockVerifyPasswordCode,
} from "@/lib/mocks/auth";
import { shouldUseMocks } from "@/lib/api/mock";
import { http, toApiError } from "@/lib/api/http";
import { getRefreshToken } from "@/lib/auth";
import type {
  AuthGoogleLoginRequest,
  AuthGoogleRegisterStartRequest,
  AuthGoogleRegisterStartResponse,
  AuthGoogleRegisterVerifyRequest,
  CompleteGoogleProfileRequest,
  CompleteGoogleProfileResponse,
  AuthForgotPasswordRequest,
  AuthForgotPasswordVerifyRequest,
  AuthForgotPasswordResetRequest,
  AuthForgotPasswordResponse,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
} from "@/lib/api/types";

export async function login(
  input: AuthLoginRequest,
): Promise<AuthLoginResponse> {
  if (shouldUseMocks()) {
    return mockLogin(input);
  }

  try {
    const response = await http.post<AuthLoginResponse>("/auth/login", input);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return mockLogin(input);
    }
    throw new Error(toApiError(error).message);
  }
}

export async function refreshAccessToken(): Promise<AuthLoginResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token.");
  }

  try {
    const response = await http.post<AuthLoginResponse>(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
        timeout: 10_000,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await http.post(
      "/auth/logout",
      {},
      {
        // If logout endpoint fails, we still clear local tokens in caller.
        // Suppress duplicate global toast for explicit user-initiated logout.
        headers: { "x-skip-error-toast": "1" },
      },
    );
  } catch {
    // no-op: caller will always clear local session
  }
}

export async function googleLogin(
  input: AuthGoogleLoginRequest,
): Promise<AuthLoginResponse> {
  try {
    const response = await http.post<AuthLoginResponse>(
      "/auth/google/login",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function googleRegisterStart(
  input: AuthGoogleRegisterStartRequest,
): Promise<AuthGoogleRegisterStartResponse> {
  try {
    const response = await http.post<AuthGoogleRegisterStartResponse>(
      "/auth/google/register",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function googleRegisterVerify(
  input: AuthGoogleRegisterVerifyRequest,
): Promise<AuthLoginResponse> {
  try {
    const response = await http.post<AuthLoginResponse>(
      "/auth/google/register/verify",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function completeGoogleProfile(
  input: CompleteGoogleProfileRequest,
): Promise<CompleteGoogleProfileResponse> {
  try {
    const response = await http.post<CompleteGoogleProfileResponse>(
      "/auth/google/complete-profile",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function register(input: AuthRegisterRequest) {
  if (shouldUseMocks()) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { message: "Register success" };
  }

  try {
    const response = await http.post("/auth/register", input);
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function forgotPassword(
  input: AuthForgotPasswordRequest,
): Promise<AuthForgotPasswordResponse> {
  if (shouldUseMocks()) {
    return mockForgotPassword(input);
  }

  try {
    const response = await http.post<AuthForgotPasswordResponse>(
      "/auth/forgot-password",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function verifyForgotPasswordCode(
  input: AuthForgotPasswordVerifyRequest,
): Promise<AuthForgotPasswordResponse> {
  if (shouldUseMocks()) {
    return mockVerifyPasswordCode(input);
  }

  try {
    const response = await http.post<AuthForgotPasswordResponse>(
      "/auth/forgot-password/verify",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function resetPassword(
  input: AuthForgotPasswordResetRequest,
): Promise<AuthForgotPasswordResponse> {
  if (shouldUseMocks()) {
    return mockResetPassword(input);
  }

  try {
    const response = await http.post<AuthForgotPasswordResponse>(
      "/auth/forgot-password/reset",
      input,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

console.log("USE MOCKS:", shouldUseMocks(), process.env.NEXT_PUBLIC_USE_MOCKS);
