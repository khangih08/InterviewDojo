import { mockLogin } from "@/lib/mocks/auth";
import { shouldUseMocks } from "@/lib/api/mock";
import { http, toApiError } from "@/lib/api/http";
import type { AuthLoginRequest, AuthLoginResponse, AuthRegisterRequest } from "@/lib/api/types";

export async function login(input: AuthLoginRequest): Promise<AuthLoginResponse> {
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
