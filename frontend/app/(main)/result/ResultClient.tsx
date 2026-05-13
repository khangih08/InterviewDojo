"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { shouldUseMocks } from "@/lib/api/mock";
import { sessionsApi } from "@/lib/api/sessions";
import type { Session } from "@/lib/api/types";
import { clampScore, getScoreTone } from "@/lib/session-insights";
import { demoInterviewSessionId } from "@/lib/mocks/sessions";

type AnalysisMetric = {
  label: string;
  score: number;
};

type StoredInterviewResult = {
  sessionId: string;
  status: "processing" | "done";
  transcript: string;
  feedback: string;
  questionId: string;
  createdAt: string;
  technicalScore?: number;
  communicationScore?: number;
  metrics?: AnalysisMetric[];
};

type ResultViewModel = {
  sessionId: string;
  status: "processing" | "done";
  transcript: string;
  feedback: string;
  technicalScore: number;
  communicationScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  metrics: AnalysisMetric[];
};

function deriveFeedbackLines(feedback: string) {
  return feedback
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.endsWith(".") ? item : `${item}.`));
}

function deriveFallbackResult(
  stored: StoredInterviewResult | null,
): ResultViewModel | null {
  if (!stored) return null;

  const technicalScore = clampScore(stored.technicalScore ?? 0);
  const communicationScore = clampScore(stored.communicationScore ?? 0);
  const feedbackLines = deriveFeedbackLines(stored.feedback);

  return {
    sessionId: stored.sessionId,
    status: stored.status,
    transcript: stored.transcript,
    feedback: stored.feedback,
    technicalScore,
    communicationScore,
    strengths: feedbackLines.slice(0, 2),
    weaknesses: [
      "Add more concrete examples to back up the explanation.",
      "Go one level deeper on trade-offs and constraints.",
    ],
    suggestions: [
      "Answer in a problem, solution, trade-off structure.",
      "Anchor the explanation with one real implementation detail.",
    ],
    metrics: stored.metrics?.length
      ? stored.metrics
      : [
          { label: "Technical", score: technicalScore },
          { label: "Communication", score: communicationScore },
          {
            label: "Depth",
            score: clampScore((technicalScore * 3 + communicationScore) / 4),
          },
          {
            label: "Clarity",
            score: clampScore((communicationScore * 3 + technicalScore) / 4),
          },
          {
            label: "Confidence",
            score: clampScore((technicalScore + communicationScore + 8) / 2),
          },
          {
            label: "Structure",
            score: clampScore((technicalScore + communicationScore) / 2),
          },
        ],
  };
}

function deriveResultFromSession(session: Session): ResultViewModel | null {
  if (!session.ai_analysis) return null;

  const technicalScore = clampScore(session.ai_analysis.technical_score ?? 0);
  const communicationScore = clampScore(
    session.ai_analysis.communication_score ?? 0,
  );
  const feedback = session.ai_analysis.feedback ?? "";
  const feedbackLines = deriveFeedbackLines(feedback);

  return {
    sessionId: session.id,
    status: session.status === "COMPLETED" ? "done" : "processing",
    transcript: session.ai_analysis.transcript ?? "",
    feedback,
    technicalScore,
    communicationScore,
    strengths: feedbackLines.slice(0, 3),
    weaknesses: [
      "Use more specific examples instead of broad claims.",
      "Expand on alternative approaches before concluding.",
    ],
    suggestions: [
      "Lead with the main decision, then justify it with trade-offs.",
      "Close with one concrete impact or implementation detail.",
    ],
    metrics: [
      { label: "Technical", score: technicalScore },
      { label: "Communication", score: communicationScore },
      {
        label: "Depth",
        score: clampScore((technicalScore * 3 + communicationScore) / 4),
      },
      {
        label: "Clarity",
        score: clampScore((communicationScore * 3 + technicalScore) / 4),
      },
      {
        label: "Confidence",
        score: clampScore((technicalScore + communicationScore + 8) / 2),
      },
      {
        label: "Structure",
        score: clampScore((technicalScore + communicationScore) / 2),
      },
    ],
  };
}

function Glass({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const duration = 900;
    const startedAt = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, target]);

  return active ? value : target;
}

function ScoreCard({
  label,
  score,
  animate,
}: {
  label: string;
  score: number;
  animate: boolean;
}) {
  const displayScore = useCountUp(score, animate);
  const tone = getScoreTone(score);

  return (
    <Glass className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {label}
          </p>
          <div className="mt-4 flex items-end gap-2">
            <p className={`text-5xl font-bold ${tone.textClassName}`}>
              {displayScore}
            </p>
            <p className="pb-1 text-sm text-slate-500">/100</p>
          </div>
          <p className="mt-3 text-sm text-slate-300">{tone.label}</p>
        </div>

        <div className="relative h-20 w-20">
          <svg viewBox="0 0 120 120" className="-rotate-90">
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="url(#result-score-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={289}
              strokeDashoffset={289 - (displayScore / 100) * 289}
            />
            <defs>
              <linearGradient
                id="result-score-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Glass>
  );
}

function InsightCard({
  title,
  icon,
  items,
  accentClassName,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  accentClassName: string;
}) {
  return (
    <Glass className="p-6">
      <div className="flex items-center gap-2">
        <div className={accentClassName}>{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p className="text-sm leading-6 text-slate-200">{item}</p>
          </div>
        ))}
      </div>
    </Glass>
  );
}

function MetricBar({ metric }: { metric: AnalysisMetric }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-200">{metric.label}</p>
        <p className="text-sm font-semibold text-white">
          {clampScore(metric.score)}/100
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-[width] duration-700"
          style={{ width: `${clampScore(metric.score)}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");

  const [result, setResult] = useState<ResultViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"processing" | "done">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [animateScores, setAnimateScores] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function loadResult() {
      const storedSessionId =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("interview:lastSessionId")
          : null;
      const storedResultRaw =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("interview:lastResult")
          : null;
      const sessionId =
        sessionIdFromUrl ?? storedSessionId ?? (shouldUseMocks() ? demoInterviewSessionId : null);

      if (!sessionId) {
        setLoading(false);
        setResult(null);
        setErrorMessage(null);
        return;
      }

      let parsedStoredResult: StoredInterviewResult | null = null;
      if (storedResultRaw) {
        try {
          parsedStoredResult = JSON.parse(
            storedResultRaw,
          ) as StoredInterviewResult;
        } catch {
          parsedStoredResult = null;
        }
      }

      const storedFallback = deriveFallbackResult(parsedStoredResult);

      try {
        setLoading(true);
        setErrorMessage(null);

        const session = await sessionsApi.getSessionById(sessionId);
        if (cancelled) return;

        const sessionResult = deriveResultFromSession(session);
        if (!sessionResult) {
          setResult(storedFallback ? { ...storedFallback, sessionId } : null);
          setPhase("done");
          return;
        }

        setResult(sessionResult);
        setPhase(session.status === "COMPLETED" ? "done" : "processing");

        if (session.status !== "COMPLETED") {
          timer = window.setTimeout(() => {
            if (cancelled) return;
            setResult((current) =>
              current ? { ...current, status: "done" } : current,
            );
            setPhase("done");
          }, 1600);
        }
      } catch (error) {
        if (cancelled) return;

        if (storedFallback) {
          setResult({ ...storedFallback, sessionId, status: "done" });
          setPhase("done");
        } else {
          setResult(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load interview result.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadResult();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [sessionIdFromUrl]);

  useEffect(() => {
    if (phase !== "done" || result?.status !== "done") return;
    setAnimateScores(false);

    const timer = window.setTimeout(() => setAnimateScores(true), 80);
    return () => window.clearTimeout(timer);
  }, [phase, result?.sessionId, result?.status]);

  const displayResult = useMemo(() => result, [result]);
  const isDone = phase === "done" && result?.status === "done";
  const overallScore = displayResult
    ? Math.round(
        (displayResult.technicalScore + displayResult.communicationScore) / 2,
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#050816,#09111f)] px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
          <div className="w-full rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="space-y-4">
              <Skeleton className="h-5 w-24 bg-white/10" />
              <Skeleton className="h-10 w-2/3 bg-white/10" />
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-40 rounded-[1.5rem] bg-white/10" />
                <Skeleton className="h-40 rounded-[1.5rem] bg-white/10" />
              </div>
              <p className="text-sm text-slate-400">Loading your results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#050816,#09111f)] px-4 py-8">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-amber-400" />}
          title="Analysis unavailable"
          description={errorMessage ?? "Complete an interview session to view your results."}
          action={{ label: "Back to Interview", onClick: () => router.push("/interview") }}
          className="max-w-md border-white/10 bg-white/5 text-white"
        />
      </div>
    );
  }

  if (!isDone) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#050816,#09111f)] px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
          <Glass className="w-full overflow-hidden p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  Analyzing
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Processing your interview
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                    We are generating transcript insights, score breakdowns, and
                    coaching notes for this response.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "Transcribing answer",
                    "Scoring communication",
                    "Generating coaching notes",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-semibold text-cyan-200">
                          0{index + 1}
                        </span>
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                      </div>
                      <p className="text-sm text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-6">
                <div className="space-y-5">
                  <div className="flex gap-3">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
                      >
                        <div
                          className="h-full animate-pulse rounded-full bg-linear-to-r from-cyan-400 to-indigo-500"
                          style={{ width: `${70 + item * 10}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Session
                      </p>
                      <p className="mt-2 truncate text-sm font-medium text-white">
                        {displayResult.sessionId}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Current stage
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        AI review in progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Glass>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_30%),linear-gradient(180deg,#050816,#0a1220_42%,#08101d)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push("/interview")}
              className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-slate-300" />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Interview Result
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Performance breakdown
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review the score summary, metrics, and coaching notes from this
                interview attempt.
              </p>
            </div>
          </div>

          <Glass className="p-5 lg:min-w-70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Overall score
            </p>
            <p className="mt-2 text-4xl font-bold text-white">{overallScore}%</p>
            <p className="mt-2 text-sm text-slate-400">
              Based on technical depth and communication clarity.
            </p>
          </Glass>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <ScoreCard
            label="Technical Score"
            score={displayResult.technicalScore}
            animate={animateScores}
          />
          <ScoreCard
            label="Communication Score"
            score={displayResult.communicationScore}
            animate={animateScores}
          />
          <Glass className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Coach summary
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              {displayResult.feedback || "Your answer was analyzed successfully."}
            </p>
          </Glass>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Glass className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Transcript
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Expand to inspect the full spoken response.
                </p>
              </div>
              <button
                onClick={() => setTranscriptOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                {transcriptOpen ? "Collapse" : "Expand"}
                {transcriptOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ${transcriptOpen ? "max-h-120 opacity-100" : "max-h-24 opacity-90"}`}
            >
              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                <p className="text-sm leading-7 text-slate-300">
                  {displayResult.transcript || "No transcript available."}
                </p>
              </div>
            </div>
          </Glass>

          <Glass className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Metrics
            </p>
            <div className="mt-4 space-y-3">
              {displayResult.metrics.map((metric) => (
                <MetricBar key={metric.label} metric={metric} />
              ))}
            </div>
          </Glass>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <InsightCard
            title="Strengths"
            items={
              displayResult.strengths.length
                ? displayResult.strengths
                : ["The response showed a workable baseline structure."]
            }
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentClassName="text-emerald-400"
          />
          <InsightCard
            title="Weaknesses"
            items={displayResult.weaknesses}
            icon={<AlertCircle className="h-5 w-5" />}
            accentClassName="text-amber-400"
          />
          <InsightCard
            title="Suggestions"
            items={displayResult.suggestions}
            icon={<Lightbulb className="h-5 w-5" />}
            accentClassName="text-sky-400"
          />
        </section>

        <section className="flex gap-3 pt-2">
          <Button
            onClick={() => router.push("/interview")}
            variant="outline"
            className="flex-1"
          >
            Try Another Question
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="flex-1">
            Back to Dashboard
          </Button>
        </section>
      </div>
    </div>
  );
}
