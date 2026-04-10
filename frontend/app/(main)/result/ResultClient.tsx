"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveFallbackResult(
  stored: StoredInterviewResult | null,
): ResultViewModel | null {
  if (!stored) return null;

  const technicalScore = clampScore(stored.technicalScore ?? 0);
  const communicationScore = clampScore(stored.communicationScore ?? 0);

  return {
    sessionId: stored.sessionId,
    status: stored.status,
    transcript: stored.transcript,
    feedback: stored.feedback,
    technicalScore,
    communicationScore,
    strengths:
      stored.feedback
        .split(".")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => (item.endsWith(".") ? item : `${item}.`)) ?? [],
    weaknesses: [
      "Cần mở rộng thêm ví dụ cụ thể khi trả lời.",
      "Có thể nói chậm hơn và rõ hơn ở phần kết luận.",
    ],
    suggestions: [
      "Giữ cấu trúc trả lời theo: hiểu vấn đề, giải pháp, trade-off.",
      "Thêm một ví dụ thực tế để tăng độ thuyết phục.",
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
            label: "Balance",
            score: clampScore((technicalScore + communicationScore) / 2),
          },
        ],
  };
}

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

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80
      ? "text-emerald-400"
      : score >= 60
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </p>

      <div className="relative flex items-center justify-center">
        <svg width={120} height={120} className="-rotate-90">
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={6}
          />
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <defs>
            <linearGradient
              id="scoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgb(59,130,246)" />
              <stop offset="100%" stopColor="rgb(6,182,212)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute text-center">
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-xs text-slate-500">/100</div>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection({
  title,
  items,
  icon,
  accentClassName,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accentClassName: string;
}) {
  return (
    <Glass className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className={accentClassName}>{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <p className="text-sm leading-relaxed text-slate-200">{item}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 italic">No items to display</p>
        )}
      </div>
    </Glass>
  );
}

function RadarChart({ metrics }: { metrics: AnalysisMetric[] }) {
  const safeMetrics = metrics.slice(0, 6);
  const count = safeMetrics.length;

  if (!count) return null;

  const size = 340;
  const center = size / 2;
  const radius = 110;
  const levels = 4;
  const angleStep = (Math.PI * 2) / count;

  const polygonPoints = safeMetrics
    .map((metric, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const pct = clampScore(metric.score) / 100;
      const x = center + Math.cos(angle) * radius * pct;
      const y = center + Math.sin(angle) * radius * pct;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
          Radar overview
        </p>
        <p className="text-xs text-slate-500">MVP+</p>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
        {Array.from({ length: levels }).map((_, levelIndex) => {
          const levelRadius = radius * ((levelIndex + 1) / levels);
          const points = safeMetrics
            .map((_, metricIndex) => {
              const angle = -Math.PI / 2 + metricIndex * angleStep;
              const x = center + Math.cos(angle) * levelRadius;
              const y = center + Math.sin(angle) * levelRadius;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <polygon
              key={levelIndex}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}

        {safeMetrics.map((metric, index) => {
          const angle = -Math.PI / 2 + index * angleStep;
          const outerX = center + Math.cos(angle) * radius;
          const outerY = center + Math.sin(angle) * radius;
          const pct = clampScore(metric.score) / 100;
          const pointX = center + Math.cos(angle) * radius * pct;
          const pointY = center + Math.sin(angle) * radius * pct;

          return (
            <g key={metric.label}>
              <line
                x1={center}
                y1={center}
                x2={outerX}
                y2={outerY}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1}
              />
              <circle cx={pointX} cy={pointY} r={4} fill="rgb(56,189,248)" />
              <text
                x={center + Math.cos(angle) * (radius + 24)}
                y={center + Math.sin(angle) * (radius + 24)}
                fill="rgba(226,232,240,0.9)"
                fontSize="11"
                textAnchor={Math.cos(angle) >= 0 ? "start" : "end"}
                dominantBaseline="middle"
              >
                {metric.label} {clampScore(metric.score)}
              </text>
            </g>
          );
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(56,189,248,0.18)"
          stroke="rgb(56,189,248)"
          strokeWidth={2}
        />
      </svg>
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

  useEffect(() => {
    const storedSessionId =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("interview:lastSessionId")
        : null;

    const storedResultRaw =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("interview:lastResult")
        : null;

    const sessionId = sessionIdFromUrl ?? storedSessionId;

    if (!sessionId) {
      setLoading(false);
      setResult(null);
      return;
    }

    const parsedStoredResult = storedResultRaw
      ? (JSON.parse(storedResultRaw) as StoredInterviewResult)
      : null;

    const baseResult = deriveFallbackResult(parsedStoredResult);

    if (!baseResult) {
      setLoading(false);
      setResult(null);
      return;
    }

    setResult({
      ...baseResult,
      sessionId,
      status: "processing",
    });

    setLoading(false);
    setPhase("processing");

    const timer = window.setTimeout(() => {
      setResult((current) =>
        current
          ? {
              ...current,
              status: "done",
            }
          : current,
      );
      setPhase("done");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [sessionIdFromUrl]);

  const isDone = phase === "done" && result?.status === "done";

  const displayResult = useMemo(() => result, [result]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!displayResult) {
    return (
      <div className="min-h-screen bg-[#080c18] px-4 py-8 flex items-center justify-center">
        <Glass className="p-12 max-w-md text-center space-y-6">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Analysis unavailable
            </h2>
            <p className="text-sm text-slate-400">
              Complete an interview session to view your results.
            </p>
          </div>
          <Button onClick={() => router.push("/interview")} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interview
          </Button>
        </Glass>
      </div>
    );
  }

  if (!isDone) {
    return (
      <div className="min-h-screen bg-[#080c18] px-4 py-8">
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center text-center">
          <Glass className="w-full p-10 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/15">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Processing your interview
              </h1>
              <p className="text-sm leading-relaxed text-slate-400">
                The analysis is being prepared. This screen simulates the
                Processing state before showing Done.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Processing
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Session
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white">
                  {displayResult.sessionId}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Mode
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Frontend mock
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/interview")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Interview
              </Button>
            </div>
          </Glass>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18] px-4 py-8">
      <div className="relative mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/interview")}
            className="rounded-lg border border-white/10 p-2 transition-colors hover:bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Interview Results
            </h1>
            <p className="text-sm text-slate-400">
              Here's your performance breakdown
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Glass className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                  Analysis Status
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {displayResult.feedback || "Completed successfully."}
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">
                Done
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ScoreBadge
                label="Technical Score"
                score={displayResult.technicalScore}
              />
              <ScoreBadge
                label="Communication Score"
                score={displayResult.communicationScore}
              />
            </div>
          </Glass>

          <Glass className="p-6">
            <RadarChart metrics={displayResult.metrics} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {displayResult.metrics.slice(0, 6).map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {clampScore(metric.score)}/100
                  </p>
                </div>
              ))}
            </div>
          </Glass>
        </div>

        <Glass className="p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Your Response
          </p>
          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <p className="text-sm leading-relaxed text-slate-300 italic">
              "{displayResult.transcript || "No transcript available."}"
            </p>
          </div>
        </Glass>

        <div className="grid gap-6 lg:grid-cols-3">
          <FeedbackSection
            title="Strengths"
            items={displayResult.feedback ? [displayResult.feedback] : []}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentClassName="text-emerald-400"
          />

          <FeedbackSection
            title="Weaknesses"
            items={[
              "Cần thêm dẫn chứng cụ thể",
              "Nên đi sâu hơn vào trade-off",
            ]}
            icon={<AlertCircle className="h-5 w-5" />}
            accentClassName="text-amber-400"
          />

          <FeedbackSection
            title="Suggestions"
            items={[
              "Giữ cấu trúc câu trả lời rõ ràng hơn.",
              "Thêm một ví dụ thực tế để tăng độ tin cậy.",
            ]}
            icon={<Lightbulb className="h-5 w-5" />}
            accentClassName="text-blue-400"
          />
        </div>

        <div className="flex gap-3 pt-4">
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
        </div>
      </div>
    </div>
  );
}
