"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Filter, RotateCw, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <Card className="flashcard-front h-full border-2 border-slate-200 shadow-sm hover:border-blue-400 transition-all bg-white flex flex-col cursor-pointer">
          <CardContent className="p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-slate-500">
                  Câu hỏi ôn tập
                </Badge>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Mặt trước</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-snug">
                {question.content}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <Badge className="bg-blue-50 text-blue-600 border-blue-100">
                {question.categoryName || "IT General"}
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
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Flashcards Ôn Tập</h1>
            <p className="text-slate-500 mt-2">Lọc theo danh mục hoặc tìm theo từ khóa để bắt đầu ôn luyện.</p>
        </div>

        <div className="mb-8 mx-auto max-w-2xl">
          <label htmlFor="question-search" className="mb-2 block text-sm font-medium text-slate-700">
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64">
            <Card className="border-none shadow-sm sticky top-24">
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
                      type="button"
                      onClick={handleLoadMore}
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