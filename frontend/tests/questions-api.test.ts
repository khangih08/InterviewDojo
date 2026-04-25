import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/lib/api/mock", () => ({
  shouldUseMocks: vi.fn(() => false),
}));

vi.mock("@/lib/api/http", () => ({
  http: {
    get: mockGet,
  },
  toApiError: vi.fn((error: unknown) => ({
    message: error instanceof Error ? error.message : "unknown",
  })),
}));

import { shouldUseMocks } from "@/lib/api/mock";
import {
  getQuestionById,
  getQuestionFilters,
  getQuestions,
} from "@/lib/api/questions";

describe("questions api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(shouldUseMocks).mockReturnValue(false);
  });

  it("returns filtered mock questions when mocks are enabled", async () => {
    vi.mocked(shouldUseMocks).mockReturnValue(true);

    const result = await getQuestions({
      difficulty: "medium",
      q: "react",
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe("q2");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("normalizes paged backend question payloads", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: [
          {
            id: "q-1",
            content: "How do indexes work?",
            difficultyLevel: 5,
            categoryId: "backend",
            categoryName: "Backend",
            tags: ["sql", "db"],
          },
        ],
        meta: {
          total: 1,
          page: 2,
          limit: 5,
        },
      },
    });

    const result = await getQuestions({
      page: 2,
      limit: 5,
      q: "index",
      difficulty: "hard",
      categoryId: "backend",
      tagId: "sql",
    });

    expect(mockGet).toHaveBeenCalledWith("/questions", {
      params: {
        page: 2,
        limit: 5,
        search: "index",
        categoryId: "backend",
        difficulty: 5,
        tagId: "sql",
      },
    });
    expect(result).toEqual({
      items: [
        {
          id: "q-1",
          content: "How do indexes work?",
          category: { id: "backend", name: "Backend" },
          difficulty: "hard",
          tags: [
            { id: "sql", name: "sql" },
            { id: "db", name: "db" },
          ],
          durationSeconds: undefined,
        },
      ],
      total: 1,
      page: 2,
      limit: 5,
    });
  });

  it("returns existing paged payload without renormalizing", async () => {
    const payload = {
      items: [{ id: "q-1", content: "Question" }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockGet.mockResolvedValue({ data: payload });

    await expect(getQuestions()).resolves.toEqual(payload);
  });

  it("fetches a backend question by id and normalizes it", async () => {
    mockGet.mockResolvedValue({
      data: {
        id: "q-42",
        content: "Explain closures",
        difficultyLevel: 2,
        tags: [],
      },
    });

    await expect(getQuestionById("q-42")).resolves.toEqual({
      id: "q-42",
      content: "Explain closures",
      category: {
        id: "unknown-category",
        name: "Uncategorized",
      },
      difficulty: "easy",
      tags: [],
      durationSeconds: undefined,
    });
  });

  it("returns mock question by id when mocks are enabled", async () => {
    vi.mocked(shouldUseMocks).mockReturnValue(true);

    const result = await getQuestionById("q1");

    expect(result?.id).toBe("q1");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches filters from backend and handles paged categories", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          data: [{ id: "c-1", name: "Backend" }],
          meta: { total: 1, page: 1, limit: 10 },
        },
      })
      .mockResolvedValueOnce({
        data: [{ id: "t-1", name: "SQL" }],
      });

    await expect(getQuestionFilters()).resolves.toEqual({
      categories: [{ id: "c-1", name: "Backend" }],
      tags: [{ id: "t-1", name: "SQL" }],
    });
  });

  it("throws normalized error when backend request fails", async () => {
    mockGet.mockRejectedValue(new Error("Backend down"));

    await expect(getQuestions()).rejects.toThrow("Backend down");
  });
});
