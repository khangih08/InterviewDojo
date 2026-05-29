"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  Filter,
  RotateCw,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function getQuestionCategory(question: FlashCardQuestion) {
  return question.categoryName || question.category?.name || "IT General";
}

function FlashCardItem({ question }: { question: FlashCardQuestion }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleCard = () => setIsFlipped((value) => !value);

  return (
    <div className="flashcard-container h-80 w-full">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flashcard-inner h-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isFlipped && "is-flipped",
        )}
        onClick={toggleCard}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCard();
          }
        }}
        aria-label={isFlipped ? "Xem lại câu hỏi" : "Xem đáp án mẫu"}
      >
        <Card className="flashcard-front h-full cursor-pointer rounded-xl border-border/70 bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex h-full min-h-0 flex-col p-5">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="rounded-lg">
                Câu hỏi ôn tập
              </Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Mặt trước
              </span>
            </div>

            <h3 className="flashcard-scroll mt-5 min-h-0 flex-1 overflow-y-auto pr-2 text-lg font-semibold leading-snug text-foreground">
              {question.content}
            </h3>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
              <Badge className="min-w-0 max-w-[75%] truncate rounded-lg bg-accent text-accent-foreground hover:bg-accent">
                {getQuestionCategory(question)}
              </Badge>
              <RotateCw className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="flashcard-back h-full cursor-pointer overflow-hidden rounded-xl border-primary/35 bg-primary/5 shadow-md">
          <CardContent className="flex h-full min-h-0 flex-col p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-primary/20 pb-3 text-primary">
              <div className="flex min-w-0 items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm uppercase tracking-[0.12em]">
                  Đáp án chi tiết
                </span>
              </div>
              <RotateCw className="h-4 w-4 shrink-0" />
            </div>
            <div
              className="flashcard-scroll min-h-0 flex-1 overflow-y-auto pr-2 text-sm leading-6 text-foreground/85"
              dangerouslySetInnerHTML={{
                __html: question.sampleAnswer || "Chưa có đáp án mẫu.",
              }}
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Click để quay lại câu hỏi
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  const selectedCategory =
    categories.find((category) => category.id === currentCategoryId)?.name ||
    "Tất cả danh mục";

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

  const fetchData = useCallback(
    async (p: number, catId: string, append: boolean) => {
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
    },
    [currentSearch],
  );

  useEffect(() => {
    setLoadedPage(1);
    fetchData(1, currentCategoryId, false);
  }, [currentCategoryId, currentSearch, fetchData]);

  const handleCategoryChange = (id: string) => {
    const params = new URLSearchParams();
    if (id) params.set("categoryId", id);
    if (searchText.trim()) params.set("q", searchText.trim());
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  };

  const handleLoadMore = () => {
    const nextPage = loadedPage + 1;
    setLoadedPage(nextPage);
    fetchData(nextPage, currentCategoryId, true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in-up">
      <section className="surface-panel rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <BookOpenCheck className="h-4 w-4" />
              Flashcards
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Flashcards ôn tập
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Lọc theo danh mục hoặc tìm theo từ khóa để luyện nhanh các câu hỏi
              phỏng vấn.
            </p>
          </div>

          <div className="quiet-panel rounded-xl px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Đang xem
            </p>
            <p className="mt-1 font-medium">{selectedCategory}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="space-y-4">
          <Card className="surface-panel sticky top-6 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Danh mục
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={currentCategoryId === "" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleCategoryChange("")}
              >
                Tất cả
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={currentCategoryId === cat.id ? "default" : "ghost"}
                  className="w-full justify-start overflow-hidden text-ellipsis"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-5">
          <div className="surface-panel rounded-xl p-3">
            <label htmlFor="question-search" className="sr-only">
              Tìm kiếm câu hỏi
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="rounded-xl border border-border/50 bg-card p-5">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="mt-5 h-44 w-full rounded-xl" />
                  <Skeleton className="mt-5 h-5 w-40" />
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {items.map((question) => (
                  <FlashCardItem key={question.id} question={question} />
                ))}
              </div>

              {items.length < total && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    size="lg"
                  >
                    {loadingMore ? "Đang tải..." : "Xem thêm"}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
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
