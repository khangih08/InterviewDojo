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

  it("maps difficulty 'easy' to level 2 in backend params", async () => {
    mockGet.mockResolvedValue({
      data: { items: [], total: 0, page: 1, limit: 10 },
    });

    await getQuestions({ difficulty: "easy" });

    expect(mockGet).toHaveBeenCalledWith(
      "/questions",
      expect.objectContaining({ params: expect.objectContaining({ difficulty: 2 }) }),
    );
  });

  it("maps difficulty 'medium' to level 3 in backend params", async () => {
    mockGet.mockResolvedValue({
      data: { items: [], total: 0, page: 1, limit: 10 },
    });

    await getQuestions({ difficulty: "medium" });

    expect(mockGet).toHaveBeenCalledWith(
      "/questions",
      expect.objectContaining({ params: expect.objectContaining({ difficulty: 3 }) }),
    );
  });

  it("normalizes a backend question with difficultyLevel 3 to 'medium'", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: [{ id: "q-m", content: "Medium Q", difficultyLevel: 3, tags: [] }],
        meta: { total: 1, page: 1, limit: 10 },
      },
    });

    const result = await getQuestions();
    expect(result.items[0].difficulty).toBe("medium");
  });

  it("normalizes a backend question with null tags to an empty array", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: [{ id: "q-n", content: "No tags Q", difficultyLevel: 1, tags: null }],
        meta: { total: 1, page: 1, limit: 10 },
      },
    });

    const result = await getQuestions();
    expect(result.items[0].tags).toEqual([]);
  });

  it("filters mock questions by categoryId", async () => {
    vi.mocked(shouldUseMocks).mockReturnValue(true);

    const result = await getQuestions({ categoryId: "dsa" });

    expect(result.items.every((q) => q.category.id === "dsa")).toBe(true);
    expect(result.items[0].id).toBe("q3");
  });

  it("filters mock questions by tagId", async () => {
    vi.mocked(shouldUseMocks).mockReturnValue(true);

    const result = await getQuestions({ tagId: "react" });

    expect(result.items.every((q) => q.tags.some((t) => t.id === "react"))).toBe(true);
    expect(result.items[0].id).toBe("q2");
  });

  it("returns null when getQuestionById is called with an id that has no mock match", async () => {
    vi.mocked(shouldUseMocks).mockReturnValue(true);

    const result = await getQuestionById("does-not-exist");

    expect(result).toBeNull();
  });

  it("throws normalized error when getQuestionById backend request fails", async () => {
    mockGet.mockRejectedValue(new Error("Question not found"));

    await expect(getQuestionById("q-bad")).rejects.toThrow("Question not found");
  });

  it("returns mock filters when shouldUseMocks is true", async () => {
    vi.mocked(shouldUseMocks).mockReturnValue(true);

    const result = await getQuestionFilters();

    expect(result.categories.length).toBeGreaterThan(0);
    expect(result.tags.length).toBeGreaterThan(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("handles flat array categories response (non-paged) from backend", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: [{ id: "c-flat", name: "Flat Category" }],
      })
      .mockResolvedValueOnce({
        data: [{ id: "t-1", name: "SQL" }],
      });

    const result = await getQuestionFilters();

    expect(result.categories).toEqual([{ id: "c-flat", name: "Flat Category" }]);
  });

  it("returns empty tags array when tags response is not an array", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [{ id: "c-1", name: "Cat" }] })
      .mockResolvedValueOnce({ data: null });

    const result = await getQuestionFilters();

    expect(result.tags).toEqual([]);
  });

  it("throws normalized error when getQuestionFilters backend request fails", async () => {
    mockGet.mockRejectedValue(new Error("Filters unavailable"));

    await expect(getQuestionFilters()).rejects.toThrow("Filters unavailable");
  });
});
