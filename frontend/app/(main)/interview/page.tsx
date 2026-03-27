"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuestionById } from "@/lib/api/questions";
import type { Question } from "@/lib/api/types";
import { useMediaPreview } from "@/hooks/useMediaPreview";
import RecorderPanel from "@/components/interview/RecorderPanel";

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId") ?? "q1";

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { videoRef, enabled, error: mediaError, start, stop } = useMediaPreview();

  useEffect(() => {
    async function fetchQuestion() {
      try {
        setLoading(true);
        const data = await getQuestionById(questionId);
        setQuestion(data);
        setSecondsLeft(data?.durationSeconds ?? 120);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Không tải được câu hỏi.");
      } finally {
        setLoading(false);
      }
    }

    void fetchQuestion();
  }, [questionId]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const progress = useMemo(() => {
    const total = question?.durationSeconds ?? 120;
    return Math.max(0, Math.min(100, (secondsLeft / total) * 100));
  }, [question?.durationSeconds, secondsLeft]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Interview Practice</h2>
        <p className="mt-1 text-sm text-slate-400">Tuần 2: hiển thị câu hỏi, countdown và preview camera/mic bằng MediaDevices API.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-white/10 bg-slate-900/80 text-white shadow-none">
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-300">Đang tải câu hỏi...</p>
            ) : fetchError ? (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{fetchError}</p>
            ) : question ? (
              <>
                <p className="text-lg leading-8 text-slate-100">{question.content}</p>
                <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="rounded-full border border-white/10 px-3 py-1">{question.category.name}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 uppercase">{question.difficulty}</span>
                  {question.tags.map((tag) => (
                    <span key={tag.id} className="rounded-full border border-white/10 px-3 py-1">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-300">Không tìm thấy câu hỏi.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-900/80 text-white shadow-none">
          <CardHeader>
            <CardTitle>Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-950 p-6 text-center">
              <p className="text-sm text-slate-400">Thời gian còn lại</p>
              <p className="mt-3 text-5xl font-semibold tracking-widest">{formatTime(secondsLeft)}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsRunning(true)} className="bg-indigo-600 text-white hover:bg-indigo-500">
                Start countdown
              </Button>
              <Button variant="outline" onClick={() => setIsRunning(false)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft(question?.durationSeconds ?? 120);
                }}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

            <Card className="border border-white/10 bg-slate-900/80 text-white shadow-none">
        <CardHeader>
          <CardTitle>Camera / Microphone Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full bg-black object-cover" />
          </div>

          {mediaError ? (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
              {mediaError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {!enabled ? (
              <Button onClick={start} className="bg-emerald-600 text-white hover:bg-emerald-500">
                Bật camera + mic
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={stop}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Tắt preview
              </Button>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                enabled
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              {enabled ? "Device ready" : "Device offline"}
            </span>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
            Tuần 3 bạn chỉ cần nối tiếp phần này bằng{" "}
            <span className="font-semibold text-white">MediaRecorder</span> để start/stop record, gom blob video và upload presigned URL.
          </div>
        </CardContent>
      </Card>

      {/* 👉 WEEK 3: Recorder + Upload */}
      <RecorderPanel questionId={questionId} />
    </div>
  );
}
