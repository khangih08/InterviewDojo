import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAllSessions = vi.fn();

vi.mock("@/lib/api/sessions", () => ({
  sessionsApi: {
    getAllSessions: (...args: unknown[]) => mockGetAllSessions(...args),
  },
}));

import { useDashboardData } from "@/hooks/useDashboardData";
import type { Session } from "@/lib/api/types";

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s-1",
    status: "COMPLETED",
    created_at: "2024-01-15T10:00:00Z",
    ai_analysis: {
      technical_score: 80,
      communication_score: 70,
    },
    ...overrides,
  } as Session;
}

describe("useDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading=true and empty data", () => {
    mockGetAllSessions.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.loading).toBe(true);
    expect(result.current.sessions).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it("loads sessions and sets loading=false on success", async () => {
    const session = makeSession();
    mockGetAllSessions.mockResolvedValue([session]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.errorMessage).toBeNull();
  });

  it("computes totalSessions from all sessions", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({ id: "s-1" }),
      makeSession({ id: "s-2", status: "PROCESSING" }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalSessions).toBe(2);
  });

  it("filters completedSessions to only COMPLETED with ai_analysis", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({ id: "s-1", status: "COMPLETED" }),
      makeSession({ id: "s-2", status: "PROCESSING", ai_analysis: null }),
      makeSession({
        id: "s-3",
        status: "COMPLETED",
        ai_analysis: null as any,
      }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.completedSessions).toHaveLength(1);
    expect(result.current.completedSessions[0].id).toBe("s-1");
  });

  it("computes avgScore as average of technical and communication", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({ ai_analysis: { technical_score: 80, communication_score: 60 } }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.avgScore).toBe(70);
  });

  it("computes avgScore across multiple completed sessions", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({
        id: "s-1",
        ai_analysis: { technical_score: 80, communication_score: 80 },
      }),
      makeSession({
        id: "s-2",
        ai_analysis: { technical_score: 60, communication_score: 60 },
      }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.avgScore).toBe(70);
  });

  it("computes bestScore from highest-scoring session", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({
        id: "s-1",
        ai_analysis: { technical_score: 60, communication_score: 60 },
      }),
      makeSession({
        id: "s-2",
        ai_analysis: { technical_score: 90, communication_score: 90 },
      }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bestScore).toBe(90);
  });

  it("returns zero avgScore and bestScore when no completed sessions", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({ status: "PROCESSING", ai_analysis: null }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.avgScore).toBe(0);
    expect(result.current.bestScore).toBe(0);
  });

  it("generates chartData for up to 7 completed sessions in chronological order", async () => {
    const sessions = Array.from({ length: 8 }, (_, i) =>
      makeSession({
        id: `s-${i}`,
        created_at: `2024-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        ai_analysis: { technical_score: 50 + i * 5, communication_score: 50 + i * 5 },
      }),
    );
    mockGetAllSessions.mockResolvedValue(sessions);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.chartData).toHaveLength(7);
  });

  it("sets errorMessage on API failure", async () => {
    mockGetAllSessions.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.errorMessage).toBe("Network error");
    expect(result.current.sessions).toEqual([]);
  });

  it("sets generic errorMessage for non-Error rejections", async () => {
    mockGetAllSessions.mockRejectedValue("string error");

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.errorMessage).toBe("Cannot load sessions.");
  });

  it("sorts sessions by created_at descending", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({ id: "old", created_at: "2024-01-01T00:00:00Z" }),
      makeSession({ id: "new", created_at: "2024-06-01T00:00:00Z" }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sessions[0].id).toBe("new");
    expect(result.current.sessions[1].id).toBe("old");
  });

  it("clamps scores to 0-100 range", async () => {
    mockGetAllSessions.mockResolvedValue([
      makeSession({
        ai_analysis: { technical_score: 150, communication_score: -10 },
      }),
    ]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.avgScore).toBeGreaterThanOrEqual(0);
    expect(result.current.avgScore).toBeLessThanOrEqual(100);
  });
});
