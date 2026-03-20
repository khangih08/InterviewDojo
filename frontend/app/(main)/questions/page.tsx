"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    categoryId: "",
    difficulty: "",
    tagId: "",
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        const [questionRes, filterRes] = await Promise.all([
          getQuestions({ limit: 20 }),
          getQuestionFilters(),
        ]);
        setItems(questionRes.items);
        setCategories(filterRes.categories);
        setTags(filterRes.tags);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được danh sách câu hỏi.");
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    async function runFilter() {
      setLoading(true);
      try {
        const response = await getQuestions({ ...filters, limit: 20 });
        setItems(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không lọc được câu hỏi.");
      } finally {
        setLoading(false);
      }
    }

    void runFilter();
  }, [filters]);

  const totalText = useMemo(() => `${items.length} câu hỏi`, [items.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Question Bank</h2>
          <p className="text-sm text-slate-400">Lọc theo category, difficulty và tag để chuẩn bị buổi luyện tập.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{totalText}</div>
      </div>

      <Card className="border border-white/10 bg-slate-900/80 text-white shadow-none">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
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
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">Đang tải câu hỏi...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">Không có câu hỏi phù hợp.</div>
        ) : (
          items.map((question) => (
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
          ))
        )}
      </div>
    </div>
  );
}
