"use client";

import { useState, useEffect, useCallback } from "react";
import { getQuestions } from "@/lib/api/questions"; // Import hàm getQuestions mình vừa sửa ở api.ts
import type { Question, Category, Difficulty } from "@/lib/api/types";

export function useQuestions(categoryId?: string, q?: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const loadQuestions = useCallback(async (isFirstLoad: boolean) => {
    try {
      setLoading(true);
      const currentPage = isFirstLoad ? 1 : page;

      const response = await getQuestions({
        categoryId,
        q,
        page: currentPage,
        limit: limit
      });

      if (isFirstLoad) {
        setQuestions(response.items);
        setPage(2);
      } else {
        setQuestions(prev => [...prev, ...response.items]);
        setPage(prev => prev + 1);
      }

      setTotal(response.total);
      setHasMore(questions.length + response.items.length < response.total);

    } catch (error) {
      console.error("Lỗi nạp câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, q, page, questions.length]);

  useEffect(() => {
    loadQuestions(true);
  }, [categoryId, q]);

  return {
    questions,
    loading,
    hasMore,
    total,
    loadMore: () => loadQuestions(false)
  };
}