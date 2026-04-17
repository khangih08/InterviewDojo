import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuestions } from "@/hooks/useQuestions";
import type { Paged, Question } from "@/lib/api/types";

const mockGetQuestions = vi.fn();

vi.mock("@/lib/api/questions", () => ({
  getQuestions: (...args: unknown[]) => mockGetQuestions(...args),
}));

function buildQuestion(id: string, content: string): Question {
  return {
    id,
    content,
    category: {
      id: "cat-1",
      name: "Frontend",
    },
    difficulty: "easy",
    tags: [],
  };
}

describe("useQuestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads first page with current filters", async () => {
    const page1: Paged<Question> = {
      items: [buildQuestion("q-1", "What is React?")],
      total: 3,
      page: 1,
      limit: 20,
    };

    mockGetQuestions.mockResolvedValueOnce(page1);

    const { result } = renderHook(() => useQuestions("cat-1", "react"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.questions).toHaveLength(1);
      expect(result.current.questions[0].id).toBe("q-1");
      expect(result.current.total).toBe(3);
      expect(result.current.hasMore).toBe(true);
    });

    expect(mockGetQuestions).toHaveBeenCalledWith({
      categoryId: "cat-1",
      q: "react",
      page: 1,
      limit: 20,
    });
  });

  it("appends next page when loadMore is called", async () => {
    const page1: Paged<Question> = {
      items: [buildQuestion("q-1", "Question 1")],
      total: 2,
      page: 1,
      limit: 20,
    };
    const page2: Paged<Question> = {
      items: [buildQuestion("q-2", "Question 2")],
      total: 2,
      page: 2,
      limit: 20,
    };

    mockGetQuestions.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useQuestions());

    await waitFor(() => {
      expect(result.current.questions).toHaveLength(1);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.questions).toHaveLength(2);
      expect(result.current.questions.map((q) => q.id)).toEqual(["q-1", "q-2"]);
      expect(result.current.total).toBe(2);
    });

    expect(mockGetQuestions).toHaveBeenNthCalledWith(1, {
      categoryId: undefined,
      q: undefined,
      page: 1,
      limit: 20,
    });
    expect(mockGetQuestions).toHaveBeenNthCalledWith(2, {
      categoryId: undefined,
      q: undefined,
      page: 2,
      limit: 20,
    });
  });
});
