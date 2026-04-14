"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pause, Play, RotateCcw, Tag } from "lucide-react";

import RecorderPanel from "@/components/interview/RecorderPanel";
import { getQuestionById } from "@/lib/api/questions";

interface QuestionData {
  id: string;
  content: string;
  sampleAnswer: string;
  difficultyLevel: number;
  categoryId: string;
  categoryName: string;
  tags: string[];
  createdAt: string;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const DIFF_COLOR: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  hard: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
};

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}



function InterviewPageContent() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId"); // Lấy ID từ thanh URL

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!questionId) {
        setFetchErr("Không tìm thấy mã câu hỏi trên đường dẫn.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getQuestionById(questionId);

        // SỬA LỖI Ở ĐÂY: Ép kiểu dữ liệu về QuestionData để qua mặt TypeScript
        setQuestion(data as unknown as QuestionData);
      } catch (err) {
        setFetchErr(
          err instanceof Error ? err.message : "Không tải được câu hỏi.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [questionId]);

  const diffMap: Record<number, { text: string; colorKey: string }> = {
    1: { text: "Dễ", colorKey: "easy" },
    2: { text: "Trung Bình", colorKey: "medium" },
    3: { text: "Nâng Cao", colorKey: "hard" },
  };

  const currentDiff = question ? diffMap[question.difficultyLevel] || diffMap[2] : diffMap[2];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#080c18] px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Phòng Phỏng Vấn AI
          </h2>
          <p className="text-sm text-slate-400">Trả lời câu hỏi trong thời gian quy định</p>
        </div>

        <div className="space-y-5">
          <Glass className="space-y-5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Câu hỏi
            </p>

            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded-full bg-white/10" />
                <div className="h-4 w-1/2 rounded-full bg-white/10" />
              </div>
            ) : fetchError ? (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
                {fetchError}
              </p>
            ) : question ? (
              <>
                <p className="text-lg leading-8 text-slate-100">
                  {question.content}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/20">
                    {question.categoryName}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${DIFF_COLOR[currentDiff.colorKey]}`}
                  >
                    {currentDiff.text}
                  </span>

                  {question.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Không tìm thấy câu hỏi.</p>
            )}
          </Glass>
        </div>

        <RecorderPanel question={question} />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={null}>
      <InterviewPageContent />
    </Suspense>
  );
}