import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures the mock variable is initialized before vi.mock hoisting runs
const { mockGet, mockToApiError } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockToApiError: vi.fn((err: unknown) => ({
    message: err instanceof Error ? err.message : "API error",
  })),
}));

vi.mock("@/lib/api/http", () => ({
  http: { get: mockGet },
  toApiError: mockToApiError,
}));

import { getAnalysis } from "@/lib/api/analysis";

const mockAnalysis = {
  sessionId: "sess-1",
  status: "done" as const,
  technicalScore: 80,
  communicationScore: 75,
  strengths: ["Clear explanation"],
  weaknesses: ["Spoke too fast"],
  suggestions: ["Practice more"],
};

describe("getAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToApiError.mockImplementation((err: unknown) => ({
      message: err instanceof Error ? err.message : "API error",
    }));
  });

  it("fetches analysis by sessionId and returns response data", async () => {
    mockGet.mockResolvedValue({ data: mockAnalysis });

    const result = await getAnalysis("sess-1");

    expect(result.sessionId).toBe("sess-1");
    expect(result.status).toBe("done");
    expect(result.technicalScore).toBe(80);
  });

  it("calls the correct endpoint path", async () => {
    mockGet.mockResolvedValue({ data: mockAnalysis });

    await getAnalysis("sess-1");

    expect(mockGet).toHaveBeenCalledWith("/analysis/sess-1");
  });

  it("URL-encodes sessionId with special characters", async () => {
    mockGet.mockResolvedValue({ data: { ...mockAnalysis, sessionId: "a b" } });

    await getAnalysis("a b");

    expect(mockGet).toHaveBeenCalledWith("/analysis/a%20b");
  });

  it("throws an error with normalized message when the API fails", async () => {
    mockGet.mockRejectedValue(new Error("Session not found"));

    await expect(getAnalysis("bad-id")).rejects.toThrow("Session not found");
  });

  it("returns all optional fields when present in the response", async () => {
    const full = {
      ...mockAnalysis,
      transcript: "Hello world",
      metrics: [{ label: "Clarity", score: 90 }],
      summary: "Great performance",
    };
    mockGet.mockResolvedValue({ data: full });

    const result = await getAnalysis("sess-1");

    expect(result.transcript).toBe("Hello world");
    expect(result.metrics).toHaveLength(1);
    expect(result.summary).toBe("Great performance");
  });
});
