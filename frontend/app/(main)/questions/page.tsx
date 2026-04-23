"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Filter,
  RotateCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getQuestionFilters, getQuestions } from "@/lib/api/questions";
import type { Category, Difficulty, Question } from "@/lib/api/types";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type DisplayQuestion = Question & {
  sampleAnswer?: string;
  categoryName?: string;
};

function difficultyLabel(level?: Difficulty) {
  if (level === "easy") return "Dễ";
  if (level === "medium") return "Trung bình";
  if (level === "hard") return "Khó";
  return "Chưa rõ";
}

function difficultyClasses(level?: Difficulty) {
  if (level === "easy") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (level === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  if (level === "hard") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

// --- COMPONENT FLASHCARD ITEM (ĐÃ FIX RENDER HTML) ---
function FlashCardItem({ question }: { question: DisplayQuestion }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const categoryName = question.categoryName || question.category?.name || "IT General";

  return (
    <div className="flashcard-container mb-8 min-h-70 w-full">
      <div
        className={cn("flashcard-inner h-full min-h-70", isFlipped && "is-flipped")}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card className="flashcard-front flex h-full cursor-pointer flex-col border-2 border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg">
          <CardContent className="p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-slate-500">
                  Câu hỏi ôn tập
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      difficultyClasses(question.difficulty),
                    )}
                  >
                    {difficultyLabel(question.difficulty)}
                  </Badge>
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Mặt trước</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-snug">
                {question.content}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <Badge className="bg-blue-50 text-blue-600 border-blue-100">
                {categoryName}
              </Badge>
              <RotateCw size={14} className="text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="flashcard-back h-full border-2 border-blue-500 shadow-xl bg-blue-50 overflow-hidden flex flex-col cursor-pointer">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 text-blue-700 font-bold border-b border-blue-200 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="text-sm">ĐÁP ÁN CHI TIẾT</span>
              </div>
            </div>
            {/* FIX TẠI ĐÂY: Sử dụng dangerouslySetInnerHTML để hiển thị <b> và xuống dòng */}
            <div
              className="flex-1 overflow-y-auto pr-2 text-slate-700 text-sm leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: question.sampleAnswer || "Chưa có đáp án mẫu."
              }}
            />
            <p className="mt-2 text-[10px] text-blue-400 text-center italic">Click để quay lại</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- PHẦN QUẢN LÝ DANH SÁCH (GIỮ NGUYÊN) ---
function QuestionsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentQuery = (searchParams.get("q") || "").trim();
  const currentCategoryId = searchParams.get("categoryId") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const [searchInput, setSearchInput] = useState(currentQuery);

  const updateParams = useCallback(
    (
      updater: (params: URLSearchParams) => void,
      options?: { resetPage?: boolean },
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);

      if (options?.resetPage) {
        params.set("page", "1");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    getQuestionFilters().then((res) => setCategories(res.categories));
  }, []);

  useEffect(() => {
    setSearchInput(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextQuery = searchInput.trim();
      if (nextQuery === currentQuery) return;

      updateParams(
        (params) => {
          if (nextQuery) {
            params.set("q", nextQuery);
          } else {
            params.delete("q");
          }
        },
        { resetPage: true },
      );
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput, currentQuery, updateParams]);

  const fetchData = useCallback(async (p: number, catId: string, append: boolean) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);

      const res = await getQuestions({
        page: p,
        limit: PAGE_SIZE,
        q: currentQuery || undefined,
        categoryId: catId || undefined,
      });

      setItems((prev) => (append ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
    } catch (error:any) {
      toastError(error?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentQuery]);

  useEffect(() => {
    fetchData(currentPage, currentCategoryId, currentPage > 1);
  }, [currentPage, currentCategoryId, fetchData]);

  const handleCategoryChange = (id: string) => {
    updateParams(
      (params) => {
        if (id) {
          params.set("categoryId", id);
        } else {
          params.delete("categoryId");
        }
      },
      { resetPage: true },
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-linear-to-r from-cyan-50 via-white to-blue-50 px-6 py-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-cyan-700">
            <Sparkles className="h-4 w-4" />
            Question Bank
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Flashcards Ôn Tập</h1>
          <p className="mt-2 text-slate-600">Lọc theo danh mục và tìm kiếm nhanh để bắt đầu buổi luyện phù hợp.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo nội dung câu hỏi..."
              className="h-11 rounded-xl border-slate-200 pl-11 pr-11 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64">
            <Card className="sticky top-24 border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Filter size={16} /> DANH MỤC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={currentCategoryId === "" ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => handleCategoryChange("")}
                >
                  Tất cả
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={currentCategoryId === cat.id ? "default" : "ghost"}
                    className="w-full justify-start text-sm overflow-hidden text-ellipsis"
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-semibold text-slate-700">{items.length}</span> / {total} câu hỏi
              </p>
              {(currentCategoryId || currentQuery) && (
                <Button
                  variant="ghost"
                  className="h-8 text-sm text-slate-500 hover:text-slate-700"
                  onClick={() =>
                    updateParams((params) => {
                      params.delete("categoryId");
                      params.delete("q");
                    }, { resetPage: true })
                  }
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed text-slate-400">
                Không có câu hỏi nào trong mục này.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {items.map((q) => <FlashCardItem key={q.id} question={q} />)}
                </div>

                {items.length < total && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", (currentPage + 1).toString());
                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                      }}
                      disabled={loadingMore}
                      className="bg-blue-600 text-white px-10 rounded-full"
                    >
                      {loadingMore ? "Đang tải..." : "Xem thêm"}
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

export default function QuestionsPage() {
  return (
    <Suspense fallback={null}>
      <QuestionsPageContent />
    </Suspense>
  );
}