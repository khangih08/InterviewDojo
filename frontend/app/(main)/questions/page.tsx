"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Filter, RotateCw, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuestionFilters, getQuestions } from "@/lib/api/questions";
import type { Category, Question } from "@/lib/api/types";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type FlashCardQuestion = Question & {
  sampleAnswer?: string;
  categoryName?: string;
};

// --- COMPONENT FLASHCARD ITEM (ĐÃ FIX RENDER HTML) ---
function FlashCardItem({ question }: { question: FlashCardQuestion }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container min-h-70 w-full mb-8">
      <div
        className={cn("flashcard-inner h-full min-h-70", isFlipped && "is-flipped")}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card className="flashcard-front h-full border-2 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-white dark:bg-slate-900 flex flex-col cursor-pointer">
          <CardContent className="p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                  Câu hỏi ôn tập
                </Badge>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Mặt trước</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {question.content}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50">
                {question.categoryName || "IT General"}
              </Badge>
              <RotateCw size={14} className="text-blue-400 dark:text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="flashcard-back h-full border-2 border-blue-500 shadow-xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden flex flex-col cursor-pointer">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 text-blue-700 dark:text-blue-400 font-bold border-b border-blue-200 dark:border-blue-800/50 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="text-sm">ĐÁP ÁN CHI TIẾT</span>
              </div>
            </div>
            {/* FIX TẠI ĐÂY: Sử dụng dangerouslySetInnerHTML để hiển thị <b> và xuống dòng */}
            <div
              className="flex-1 overflow-y-auto pr-2 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: question.sampleAnswer || "Chưa có đáp án mẫu."
              }}
            />
            <p className="mt-2 text-[10px] text-blue-400 dark:text-blue-500/70 text-center italic">Click để quay lại</p>
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
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [loadedPage, setLoadedPage] = useState(1);
  const [isComposing, setIsComposing] = useState(false);
  const searchSyncTimerRef = useRef<number | null>(null);

  const currentCategoryId = searchParams.get("categoryId") || "";
  const currentSearch = searchParams.get("q") || "";

  useEffect(() => {
    getQuestionFilters().then((res) => setCategories(res.categories));
  }, []);

  useEffect(() => {
    setSearchText(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (isComposing) {
      return;
    }

    if (searchSyncTimerRef.current !== null) {
      window.clearTimeout(searchSyncTimerRef.current);
      searchSyncTimerRef.current = null;
    }

    searchSyncTimerRef.current = window.setTimeout(() => {
      const params = new URLSearchParams();

      if (currentCategoryId) params.set("categoryId", currentCategoryId);
      if (searchText.trim()) params.set("q", searchText.trim());

      const nextUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl, { scroll: false });
      }

      searchSyncTimerRef.current = null;
    }, 300);

    return () => {
      if (searchSyncTimerRef.current !== null) {
        window.clearTimeout(searchSyncTimerRef.current);
        searchSyncTimerRef.current = null;
      }
    };
  }, [currentCategoryId, isComposing, pathname, router, searchParams, searchText]);

  const fetchData = useCallback(async (p: number, catId: string, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await getQuestions({
        page: p,
        limit: PAGE_SIZE,
        categoryId: catId || undefined,
        q: currentSearch || undefined,
      });

      setItems((prev) => (append ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      toastError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentSearch]);

  useEffect(() => {
    setLoadedPage(1);
    fetchData(1, currentCategoryId, false);
  }, [currentCategoryId, currentSearch, fetchData]);

  const handleCategoryChange = (id: string) => {
    const params = new URLSearchParams();
    if (id) params.set("categoryId", id);
    if (searchText.trim()) params.set("q", searchText.trim());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLoadMore = () => {
    const nextPage = loadedPage + 1;
    setLoadedPage(nextPage);
    fetchData(nextPage, currentCategoryId, true);
  };

  return (
    <div className="min-h-screen pb-20 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center animate-fade-in-up">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Flashcards Ôn Tập</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Lọc theo danh mục hoặc tìm theo từ khóa để bắt đầu ôn luyện.</p>
        </div>

        <div className="mb-8 mx-auto max-w-2xl">
          <label htmlFor="question-search" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tìm kiếm câu hỏi
          </label>
          <input
            id="question-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(event) => {
              setIsComposing(false);
              setSearchText(event.currentTarget.value);
            }}
            placeholder="Nhập từ khóa để lọc câu hỏi..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
          />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64">
            <Card className="border-none shadow-sm sticky top-24 bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Filter size={16} /> DANH MỤC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={currentCategoryId === "" ? "default" : "ghost"}
                  className="w-full justify-start text-sm dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleCategoryChange("")}
                >
                  Tất cả
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={currentCategoryId === cat.id ? "default" : "ghost"}
                    className="w-full justify-start text-sm overflow-hidden text-ellipsis dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="rounded-2xl border border-border/40 bg-card p-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
                    <Skeleton className="mt-4 h-4 w-40" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Filter size={24} />}
                title="Không có câu hỏi nào trong mục này"
                description="Thử xóa bộ lọc hoặc đổi từ khóa để xem thêm câu hỏi mẫu."
                action={{
                  label: "Xóa bộ lọc",
                  onClick: () => {
                    setSearchText("");
                    router.replace(pathname, { scroll: false });
                  },
                }}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {items.map((q) => <FlashCardItem key={q.id} question={q} />)}
                </div>

                {items.length < total && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-full dark:bg-blue-600 dark:hover:bg-blue-700"
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