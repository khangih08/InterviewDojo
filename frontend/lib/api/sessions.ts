import { http, toApiError } from "@/lib/api/http";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  CompleteSessionRequest,
  CompleteSessionResponse,
  UserSession,
  Session,
} from "@/lib/api/types";

/**
 * Interview Sessions API - for managing interview practice sessions
 */
export async function createSession(
  payload: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  try {
    const response = await http.post<CreateSessionResponse>(
      "/sessions",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function completeSession(
  payload: CompleteSessionRequest,
): Promise<CompleteSessionResponse> {
  try {
    const response = await http.post<CompleteSessionResponse>(
      "/session/complete",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

// Interview sessions API - for practice history
export const sessionsApi = {
  // GET /sessions - get interview sessions
  getAllSessions: async (): Promise<Session[]> => {
    try {
      const response = await http.get<Session[]>("/sessions");
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },

  // GET /sessions/:id - get interview session by ID
  getSessionById: async (id: string): Promise<Session> => {
    try {
      const response = await http.get<Session>(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },
};

/**
 * User Auth Sessions API - for managing user login sessions across devices
 */
export const userSessionsApi = {
  // GET /sessions - get all user auth sessions
  getAllSessions: async (): Promise<UserSession[]> => {
    try {
      const response = await http.get<UserSession[]>("/sessions");
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },

  // GET /sessions/:id - get user session by ID
  getSessionById: async (id: string): Promise<UserSession> => {
    try {
      const response = await http.get<UserSession>(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },

  // DELETE /sessions/:id - revoke a specific session
  revokeSession: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await http.delete<{ message: string }>(
        `/sessions/${id}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },

  // DELETE /sessions/revoke/all-other - revoke all other sessions
  revokeAllOtherSessions: async (): Promise<{
    message: string;
    revoked_count: number;
  }> => {
    try {
      const response = await http.delete<{
        message: string;
        revoked_count: number;
      }>("/sessions/revoke/all-other");
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },

  // DELETE /sessions - revoke all sessions
  revokeAllSessions: async (): Promise<{
    message: string;
    revoked_count: number;
  }> => {
    try {
      const response = await http.delete<{
        message: string;
        revoked_count: number;
      }>("/sessions");
      return response.data;
    } catch (error) {
      throw new Error(toApiError(error).message);
    }
  },
};
