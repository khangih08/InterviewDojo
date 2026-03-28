import { http, toApiError } from "@/lib/api/http";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  CompleteSessionRequest,
  CompleteSessionResponse,
} from "@/lib/api/types";

export async function createSession(
  payload: CreateSessionRequest
): Promise<CreateSessionResponse> {
  try {
    const response = await http.post<CreateSessionResponse>("/sessions", payload);
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function completeSession(
  payload: CompleteSessionRequest
): Promise<CompleteSessionResponse> {
  try {
    const response = await http.post<CompleteSessionResponse>(
      "/session/complete",
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}