"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuestionFilters, getQuestions } from "@/lib/api/questions";
import type { Category, Difficulty, Question, Tag } from "@/lib/api/types";

type FilterState = {
  q: string;
  categoryId: string;
  difficulty: Difficulty | "";
  tagId: string;
};

export default function QuestionsPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    categoryId: "",
    difficulty: "",
    tagId: "",
  });

  const fetchQuestions = useCallback(async (isFirstLoad: boolean) => {
    try {
      if (isFirstLoad) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const targetPage = isFirstLoad ? 1 : page + 1;
      const response = await getQuestions({
        ...filters,
        page: targetPage,
        limit: 20
      });

      if (isFirstLoad) {
        setItems(response.items);
      } else {
        setItems((prev) => [...prev, ...response.items]);
        setPage(targetPage);
      }

      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được câu hỏi.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, page]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const filterRes = await getQuestionFilters();
        setCategories(filterRes.categories);
        setTags(filterRes.tags);
      } catch (err) {
        console.error("Lỗi load filters:", err);
      }
    }
    void loadFilters();
  }, []);

  useEffect(() => {
    void fetchQuestions(true);
  }, [filters]);

  const totalText = useMemo(() => `Đang hiện ${items.length} / ${total} câu hỏi`, [items.length, total]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Question Bank</h2>
          <p className="text-sm text-slate-400">Luyện tập với 1712 câu hỏi phỏng vấn IT.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{totalText}</div>
      </div>

      <Card className="border border-white/10 bg-slate-900/80 text-white shadow-none">
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Tìm theo keyword"
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none placeholder:text-slate-500"
            />
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none"
            >
              <option value="">Tất cả category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value as Difficulty | "" }))}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none"
            >
              <option value="">Tất cả độ khó</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={filters.tagId}
              onChange={(e) => setFilters((prev) => ({ ...prev, tagId: e.target.value }))}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none"
            >
              <option value="">Tất cả tag</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {error ? <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-4">
        {loading && items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">Đang tải câu hỏi...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">Không có câu hỏi phù hợp.</div>
        ) : (
          <>
            {items.map((question) => (
              <Card key={question.id} className="border border-white/10 bg-slate-900/80 text-white shadow-none">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle className="text-lg">{question.content}</CardTitle>
                      <p className="mt-2 text-sm text-slate-400">Category: {question.category.name}</p>
                    </div>
                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-200">
                      {question.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span key={tag.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-500">
                      <Link href={`/interview?questionId=${question.id}`}>Luyện câu này</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* NÚT XEM THÊM */}
            {items.length < total && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => fetchQuestions(false)}
                  disabled={loadingMore}
                  className="bg-slate-700 px-10 hover:bg-slate-600"
                >
                  {loadingMore ? "Đang tải thêm..." : "Xem thêm câu hỏi"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}