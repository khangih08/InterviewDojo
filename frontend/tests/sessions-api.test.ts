import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/api/http", () => ({
  http: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
  toApiError: vi.fn((error: unknown) => ({
    message: error instanceof Error ? error.message : "unknown",
  })),
}));

import {
  completeSession,
  createSession,
  sessionsApi,
  userSessionsApi,
} from "@/lib/api/sessions";

describe("sessions api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a session", async () => {
    mockPost.mockResolvedValue({ data: { session_id: "s-1" } });

    await expect(createSession({ question_id: "q-1" })).resolves.toEqual({
      session_id: "s-1",
    });
    expect(mockPost).toHaveBeenCalledWith("/sessions", { question_id: "q-1" });
  });

  it("completes a session", async () => {
    const payload = {
      session_id: "s-1",
      recording_url: "https://example.com/video.webm",
      duration_seconds: 120,
      size_bytes: 1024,
      mime_type: "video/webm",
    };
    mockPost.mockResolvedValue({ data: { success: true } });

    await expect(completeSession(payload)).resolves.toEqual({ success: true });
    expect(mockPost).toHaveBeenCalledWith("/session/complete", payload);
  });

  it("gets all interview sessions", async () => {
    mockGet.mockResolvedValue({ data: [{ id: "s-1" }] });

    await expect(sessionsApi.getAllSessions()).resolves.toEqual([{ id: "s-1" }]);
    expect(mockGet).toHaveBeenCalledWith("/sessions");
  });

  it("gets a session by id", async () => {
    mockGet.mockResolvedValue({ data: { id: "s-2" } });

    await expect(sessionsApi.getSessionById("s-2")).resolves.toEqual({
      id: "s-2",
    });
    expect(mockGet).toHaveBeenCalledWith("/sessions/s-2");
  });

  it("gets all user auth sessions", async () => {
    mockGet.mockResolvedValue({ data: [{ id: "u-s-1" }] });

    await expect(userSessionsApi.getAllSessions()).resolves.toEqual([
      { id: "u-s-1" },
    ]);
  });

  it("gets a single user auth session", async () => {
    mockGet.mockResolvedValue({ data: { id: "u-s-2" } });

    await expect(userSessionsApi.getSessionById("u-s-2")).resolves.toEqual({
      id: "u-s-2",
    });
  });

  it("revokes a session by id", async () => {
    mockDelete.mockResolvedValue({ data: { message: "revoked" } });

    await expect(userSessionsApi.revokeSession("u-s-3")).resolves.toEqual({
      message: "revoked",
    });
    expect(mockDelete).toHaveBeenCalledWith("/sessions/u-s-3");
  });

  it("revokes all other sessions", async () => {
    mockDelete.mockResolvedValue({
      data: { message: "revoked", revoked_count: 2 },
    });

    await expect(userSessionsApi.revokeAllOtherSessions()).resolves.toEqual({
      message: "revoked",
      revoked_count: 2,
    });
    expect(mockDelete).toHaveBeenCalledWith("/sessions/revoke/all-other");
  });

  it("revokes all sessions", async () => {
    mockDelete.mockResolvedValue({
      data: { message: "revoked", revoked_count: 3 },
    });

    await expect(userSessionsApi.revokeAllSessions()).resolves.toEqual({
      message: "revoked",
      revoked_count: 3,
    });
    expect(mockDelete).toHaveBeenCalledWith("/sessions");
  });

  it("throws normalized errors", async () => {
    mockPost.mockRejectedValue(new Error("request failed"));

    await expect(createSession({ question_id: "q-1" })).rejects.toThrow(
      "request failed",
    );
  });
});
