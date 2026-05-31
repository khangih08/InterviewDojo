import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost, mockDelete, mockShouldUseMocks } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockShouldUseMocks: vi.fn().mockReturnValue(false),
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

vi.mock("@/lib/api/mock", () => ({
  shouldUseMocks: mockShouldUseMocks,
}));

vi.mock("@/lib/mocks/sessions", () => ({
  demoInterviewSessionId: "demo-123",
  getDemoInterviewSessions: vi.fn().mockReturnValue([{ id: "demo-s-1" }]),
  getDemoInterviewSessionById: vi.fn((id: string) =>
    id === "demo-123" ? { id: "demo-123" } : null,
  ),
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

    await expect(sessionsApi.getAllSessions("u-1")).resolves.toEqual([{ id: "s-1" }]);
    expect(mockGet).toHaveBeenCalledWith("/interviews?userId=u-1");
  });


  it("gets a session by id", async () => {
    mockGet.mockResolvedValue({ data: { id: "s-2" } });

    await expect(sessionsApi.getSessionById("s-2")).resolves.toEqual({
      id: "s-2",
    });
    expect(mockGet).toHaveBeenCalledWith("/interviews/s-2");
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

  it("returns mock sessions when shouldUseMocks returns true", async () => {
    mockShouldUseMocks.mockReturnValueOnce(true);

    const result = await sessionsApi.getAllSessions();

    expect(result).toEqual([{ id: "demo-s-1" }]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("returns mock session by id when shouldUseMocks returns true", async () => {
    mockShouldUseMocks.mockReturnValueOnce(true);

    const result = await sessionsApi.getSessionById("demo-123");

    expect(result).toEqual({ id: "demo-123" });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("falls back to demo session when mock session id not found", async () => {
    mockShouldUseMocks.mockReturnValueOnce(true);

    const result = await sessionsApi.getSessionById("unknown-id");

    expect(result).toEqual({ id: "demo-123" });
  });

  it("throws normalized errors on createSession failure", async () => {
    mockPost.mockRejectedValue(new Error("request failed"));

    await expect(createSession({ question_id: "q-1" })).rejects.toThrow(
      "request failed",
    );
  });

  it("throws normalized error on completeSession failure", async () => {
    mockPost.mockRejectedValue(new Error("upload failed"));

    await expect(
      completeSession({
        session_id: "s-1",
        recording_url: "https://example.com/v.webm",
        duration_seconds: 60,
        size_bytes: 512,
        mime_type: "video/webm",
      }),
    ).rejects.toThrow("upload failed");
  });

  it("throws normalized error on sessionsApi.getAllSessions failure", async () => {
    mockGet.mockRejectedValue(new Error("server error"));

    await expect(sessionsApi.getAllSessions()).rejects.toThrow("server error");
  });

  it("throws normalized error on sessionsApi.getSessionById failure", async () => {
    mockGet.mockRejectedValue(new Error("not found"));

    await expect(sessionsApi.getSessionById("bad-id")).rejects.toThrow(
      "not found",
    );
  });

  it("throws normalized error on userSessionsApi.getAllSessions failure", async () => {
    mockGet.mockRejectedValue(new Error("unauthorized"));

    await expect(userSessionsApi.getAllSessions()).rejects.toThrow(
      "unauthorized",
    );
  });

  it("throws normalized error on userSessionsApi.getSessionById failure", async () => {
    mockGet.mockRejectedValue(new Error("session not found"));

    await expect(userSessionsApi.getSessionById("u-s-99")).rejects.toThrow(
      "session not found",
    );
  });

  it("throws normalized error on userSessionsApi.revokeSession failure", async () => {
    mockDelete.mockRejectedValue(new Error("revoke failed"));

    await expect(userSessionsApi.revokeSession("u-s-1")).rejects.toThrow(
      "revoke failed",
    );
  });

  it("throws normalized error on userSessionsApi.revokeAllOtherSessions failure", async () => {
    mockDelete.mockRejectedValue(new Error("revoke all failed"));

    await expect(userSessionsApi.revokeAllOtherSessions()).rejects.toThrow(
      "revoke all failed",
    );
  });

  it("throws normalized error on userSessionsApi.revokeAllSessions failure", async () => {
    mockDelete.mockRejectedValue(new Error("revoke all failed"));

    await expect(userSessionsApi.revokeAllSessions()).rejects.toThrow(
      "revoke all failed",
    );
  });
});
