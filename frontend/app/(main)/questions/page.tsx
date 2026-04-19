"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Filter, RotateCw, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQuestionFilters, getQuestions } from "@/lib/api/questions";
import type { Category, Question } from "@/lib/api/types";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

function FlashCardItem({ question }: { question: any }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container min-h-[280px] w-full mb-8">
      <div
        className={cn("flashcard-inner h-full min-h-[280px]", isFlipped && "is-flipped")}
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
            <div className="flex-1 overflow-y-auto pr-2 text-slate-700 text-sm leading-relaxed">
               {question.sampleAnswer || "Chưa có đáp án mẫu."}
            </div>
            <p className="mt-2 text-[10px] text-blue-400 text-center italic">Click để quay lại</p>
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

  const currentCategoryId = searchParams.get("categoryId") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    getQuestionFilters().then((res) => setCategories(res.categories));
  }, []);

  const fetchData = useCallback(async (p: number, catId: string, append: boolean) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);

      const res = await getQuestions({
        page: p,
        limit: PAGE_SIZE,
        categoryId: catId || undefined, // Chỉ gửi categoryId
      });

      setItems((prev) => (append ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, currentCategoryId, currentPage > 1);
  }, [currentPage, currentCategoryId, fetchData]);

  const handleCategoryChange = (id: string) => {
    const params = new URLSearchParams();
    if (id) params.set("categoryId", id);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Flashcards Ôn Tập</h1>
            <p className="text-slate-500 mt-2">Lọc theo danh mục để bắt đầu ôn luyện.</p>
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
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", (currentPage + 1).toString());
                        router.push(`${pathname}?${params.toString()}`);
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