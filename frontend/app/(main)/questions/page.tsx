"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuestionFilters, getQuestions } from "@/lib/api/questions";
import type { Category, Difficulty, Question, Tag } from "@/lib/api/types";
import { toastError } from "@/lib/toast";

type FilterState = {
  q: string;
  categoryId: string;
  difficulty: Difficulty | "";
  tagId: string;
};

const PAGE_SIZE = 20;

function parseFiltersFromQuery(query: URLSearchParams): {
  filters: FilterState;
  page: number;
} {
  const pageFromUrl = Number(query.get("page") || "1");

  return {
    filters: {
      q: query.get("q") ?? "",
      categoryId: query.get("categoryId") ?? "",
      difficulty: (query.get("difficulty") as Difficulty | "") ?? "",
      tagId: query.get("tagId") ?? "",
    },
    page: Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
  };
}

function toQueryString(filters: FilterState, page: number) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.tagId) params.set("tagId", filters.tagId);
  if (page > 1) params.set("page", String(page));

  return params.toString();
}

function equalFilters(a: FilterState, b: FilterState) {
  return (
    a.q === b.q &&
    a.categoryId === b.categoryId &&
    a.difficulty === b.difficulty &&
    a.tagId === b.tagId
  );
}

const difficultyClass: Record<Difficulty, string> = {
  easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  hard: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function QuestionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQueryString = searchParams.toString();

  const initialFromUrl = useMemo(
    () => parseFiltersFromQuery(new URLSearchParams(currentQueryString)),
    [currentQueryString],
  );

  const [items, setItems] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialFromUrl.page);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<FilterState>(initialFromUrl.filters);
  const [queryDraft, setQueryDraft] = useState(initialFromUrl.filters.q);

  const fetchQuestions = useCallback(async () => {
    const append = page > 1;
    try {
      setError(null);
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await getQuestions({
        ...filters,
        page,
        limit: PAGE_SIZE,
      });

      if (append) {
        setItems((prev) => {
          const known = new Set(prev.map((item) => item.id));
          const incoming = response.items.filter((item) => !known.has(item.id));
          return [...prev, ...incoming];
        });
      } else {
        setItems(response.items);
      }

      setTotal(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không tải được câu hỏi.";
      setError(message);
      toastError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const parsed = parseFiltersFromQuery(new URLSearchParams(currentQueryString));

    setFilters((prev) => (equalFilters(prev, parsed.filters) ? prev : parsed.filters));
    setPage((prev) => (prev === parsed.page ? prev : parsed.page));
    setQueryDraft((prev) => (prev === parsed.filters.q ? prev : parsed.filters.q));
  }, [currentQueryString, searchParams]);

  useEffect(() => {
    const queryString = toQueryString(filters, page);
    const current = currentQueryString;
    if (queryString === current) return;

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [filters, page, pathname, router, currentQueryString]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => {
        if (prev.q === queryDraft) return prev;
        return { ...prev, q: queryDraft };
      });
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [queryDraft]);

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
    void fetchQuestions();
  }, [fetchQuestions]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const totalText = useMemo(() => `Đang hiện ${items.length} / ${total} câu hỏi`, [items.length, total]);
  const hasActiveFilters = Boolean(
    filters.q || filters.categoryId || filters.difficulty || filters.tagId,
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Question Bank</h2>
          <p className="text-sm text-slate-500">Luyện tập với bộ câu hỏi thực tế, filter nhanh theo role và độ khó.</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
          {totalText}
        </div>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <Filter className="h-4 w-4 text-blue-600" />
              Filter Sidebar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={filters.categoryId}
              onChange={(e) => updateFilter("categoryId", e.target.value)}
              aria-label="Filter by category"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
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
              onChange={(e) => updateFilter("difficulty", e.target.value as Difficulty | "")}
              aria-label="Filter by difficulty"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
            >
              <option value="">Tất cả độ khó</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filters.tagId}
              onChange={(e) => updateFilter("tagId", e.target.value)}
              aria-label="Filter by tag"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
            >
              <option value="">Tất cả tag</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              className="w-full"
              disabled={!hasActiveFilters}
              onClick={() => {
                setQueryDraft("");
                setFilters({ q: "", categoryId: "", difficulty: "", tagId: "" });
                setPage(1);
              }}
            >
              Xóa toàn bộ filter
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={queryDraft}
                onChange={(e) => setQueryDraft(e.target.value)}
                placeholder="Search theo keyword, ví dụ: React hooks, system design..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              {queryDraft ? (
                <button
                  type="button"
                  onClick={() => setQueryDraft("")}
                  className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4">
            {loading && items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Đang tải câu hỏi...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Không có câu hỏi phù hợp.
              </div>
            ) : (
              <>
                {items.map((question) => (
                  <Card
                    key={question.id}
                    className="group border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle className="text-lg leading-7 text-slate-900 transition group-hover:text-blue-700">
                            {question.content}
                          </CardTitle>
                          <p className="mt-2 text-sm text-slate-500">Category: {question.category.name}</p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${difficultyClass[question.difficulty]}`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap gap-2">
                          {question.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                        <Button asChild className="bg-blue-600 text-white hover:bg-blue-500">
                          <Link href={`/interview?questionId=${question.id}`}>Luyện câu này</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {items.length < total && (
                  <div className="mt-2 flex justify-center">
                    <Button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={loadingMore}
                      className="bg-slate-800 px-10 text-white hover:bg-slate-700"
                    >
                      {loadingMore ? "Đang tải thêm..." : "Xem thêm câu hỏi"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}