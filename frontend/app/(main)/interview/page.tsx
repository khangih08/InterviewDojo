"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  CameraOff,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getQuestionById } from "@/lib/api/questions";
import type { Question } from "@/lib/api/types";
import { useMediaPreview } from "@/hooks/useMediaPreview";
import RecorderPanel from "@/components/interview/RecorderPanel";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const DIFF_COLOR: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/15   text-amber-300   ring-1 ring-amber-500/30",
  hard: "bg-rose-500/15    text-rose-300    ring-1 ring-rose-500/30",
};

// ─── glass card primitive ────────────────────────────────────────────────────

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

// ─── circular countdown ──────────────────────────────────────────────────────

function CircularTimer({
  secondsLeft,
  total,
}: {
  secondsLeft: number;
  total: number;
}) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, secondsLeft / total));
  const dash = pct * C;

  const colour = pct > 0.5 ? "#6366f1" : pct > 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={128} height={128} className="-rotate-90">
        {/* track */}
        <circle
          cx={64}
          cy={64}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
        />
        {/* progress */}
        <circle
          cx={64}
          cy={64}
          r={R}
          fill="none"
          stroke={colour}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s" }}
        />
      </svg>
      <span
        className="absolute text-3xl font-semibold tabular-nums tracking-widest text-white"
        style={{ textShadow: `0 0 20px ${colour}88` }}
      >
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}

// ─── main content ────────────────────────────────────────────────────────────

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId") ?? "q1";

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSeconds] = useState(120);
  const [isRunning, setRunning] = useState(false);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  const {
    videoRef,
    enabled,
    error: mediaError,
    start,
    stop,
  } = useMediaPreview();

  // fetch question
  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const data = await getQuestionById(questionId);
        setQuestion(data);
        setSeconds(data?.durationSeconds ?? 120);
      } catch (err) {
        setFetchErr(
          err instanceof Error ? err.message : "Không tải được câu hỏi.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [questionId]);

  // countdown
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSeconds((p) => {
        if (p <= 1) {
          clearInterval(id);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, secondsLeft]);

  const total = question?.durationSeconds ?? 120;
  const progress = useMemo(
    () => Math.max(0, Math.min(100, (secondsLeft / total) * 100)),
    [secondsLeft, total],
  );
  const diffKey = (question?.difficulty ?? "medium").toLowerCase();

  function reset() {
    setRunning(false);
    setSeconds(total);
  }

  return (
    <div className="min-h-screen bg-[#080c18] px-4 py-8">
      {/* ── ambient blobs ── */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* ── header ── */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Interview Practice
          </h2>
          <p className="text-sm text-slate-400">
            Tuần 2 · question display · countdown · camera / mic preview
          </p>
        </div>

        {/* ── row 1: question + timer ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* question card */}
          <Glass className="p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Question
            </p>

            {loading ? (
              <div className="space-y-3 animate-pulse">
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
                  {/* category */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/20">
                    {question.category.name}
                  </span>

                  {/* difficulty */}
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${DIFF_COLOR[diffKey] ?? DIFF_COLOR.medium}`}
                  >
                    {question.difficulty}
                  </span>

                  {/* tags */}
                  {question.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10"
                    >
                      <Tag size={10} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Không tìm thấy câu hỏi.</p>
            )}
          </Glass>

          {/* timer card */}
          <Glass className="flex flex-col items-center gap-5 p-6">
            <p className="self-start text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Timer
            </p>

            <CircularTimer secondsLeft={secondsLeft} total={total} />

            {/* thin linear bar */}
            <div className="w-full space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-[11px] text-slate-500">
                {Math.round(progress)}% remaining
              </p>
            </div>

            {/* controls */}
            <div className="grid w-full grid-cols-3 gap-2">
              <button
                onClick={() => setRunning(true)}
                disabled={isRunning || secondsLeft === 0}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
              >
                <Play size={12} /> Start
              </button>
              <button
                onClick={() => setRunning(false)}
                disabled={!isRunning}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                <Pause size={12} /> Pause
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </Glass>
        </div>

        {/* ── row 2: camera ── */}
        <Glass className="overflow-hidden">
          {/* header strip */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Camera · Microphone
            </p>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                enabled
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-slate-700/60 text-slate-400 ring-1 ring-white/10"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-500"}`}
              />
              {enabled ? "Device ready" : "Device offline"}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {/* video */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="aspect-video w-full object-cover"
              />
              {!enabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                  <Camera size={36} className="text-slate-600" />
                  <p className="text-xs text-slate-500">Camera chưa bật</p>
                </div>
              )}
            </div>

            {/* error */}
            {mediaError && (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                {mediaError}
              </p>
            )}

            {/* toggle button */}
            <div className="flex items-center gap-3">
              {!enabled ? (
                <button
                  onClick={start}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  <Camera size={15} /> Bật camera + mic
                </button>
              ) : (
                <button
                  onClick={stop}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <CameraOff size={15} /> Tắt preview
                </button>
              )}
            </div>

            {/* week-3 hint */}
            <p className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-400">
              <span className="font-semibold text-white">Tuần 3 →</span> nối
              tiếp phần này bằng{" "}
              <code className="rounded bg-white/10 px-1 text-indigo-300">
                MediaRecorder
              </code>{" "}
              để start / stop record, gom blob video và upload presigned URL.
            </p>
          </div>
        </Glass>

        {/* ── recorder panel ── */}
        <RecorderPanel questionId={questionId} />
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
