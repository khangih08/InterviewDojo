"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────

type InterviewResult = {
  transcript: string;
  technicalScore: number;
  communicationScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_RESULT: InterviewResult = {
  transcript:
    "I would implement this using a hash map to store the first occurrence of each character, then iterate through the string again to find the minimum index. Time complexity would be O(n) and space complexity O(m) where m is the size of the charset.",
  technicalScore: 78,
  communicationScore: 82,
  strengths: [
    "Clear explanation of the algorithm approach",
    "Correctly identified time and space complexity",
    "Demonstrated knowledge of data structures",
  ],
  weaknesses: [
    "Didn't mention edge cases (empty string, no unique chars)",
    "Could have explained the hash map implementation more",
  ],
  suggestions: [
    "Practice discussing edge cases before diving into the solution",
    "Consider mentioning alternative approaches and trade-offs",
    "Slow down your speech to give the interviewer time to follow",
  ],
};

// ─── Glass card primitive ────────────────────────────────────────────────────

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

// ─── Score Badge ─────────────────────────────────────────────────────────

function ScoreBadge({
  label,
  score,
  gradientFrom = "from-blue-500",
  gradientTo = "to-cyan-500",
}: {
  label: string;
  score: number;
  gradientFrom?: string;
  gradientTo?: string;
}) {
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
          {/* background circle */}
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={6}
          />
          {/* progress circle */}
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
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
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

// ─── Feedback Item ────────────────────────────────────────────────────────

function FeedbackItem({
  item,
  icon: Icon,
  accentColor,
}: {
  item: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="flex gap-3 items-start group">
      <div
        className={`mt-1 flex-shrink-0 text-lg transition-transform group-hover:scale-110 ${accentColor}`}
      >
        {Icon}
      </div>
      <p className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-100 transition-colors">
        {item}
      </p>
    </div>
  );
}

// ─── Feedback Section ─────────────────────────────────────────────────────

function FeedbackSection({
  title,
  items,
  icon: Icon,
  accentBg,
  accentBorder,
  accentText,
  accentIcon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentIcon: string;
}) {
  return (
    <Glass className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className={`${accentIcon}`}>{Icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg ${accentBg} border ${accentBorder} p-3 transition-all hover:shadow-lg hover:shadow-${accentText.split("-")[1]}-500/20`}
            >
              <p
                className={`text-sm ${accentText} font-medium leading-relaxed`}
              >
                {item}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 italic">No items to display</p>
        )}
      </div>
    </Glass>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function InterviewResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading result from sessionStorage or API
    setTimeout(() => {
      // In production, load from sessionStorage:
      // const stored = sessionStorage.getItem("interview:lastResult");
      // setResult(stored ? JSON.parse(stored) : MOCK_RESULT);

      setResult(MOCK_RESULT);
      setLoading(false);
    }, 300);
  }, []);

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

  if (!result) {
    return (
      <div className="min-h-screen bg-[#080c18] px-4 py-8 flex items-center justify-center">
        <Glass className="p-12 max-w-md text-center space-y-6">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              No Results Found
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

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* ── header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/interview")}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
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

        {/* ── scores row ── */}
        <div className="grid gap-6 md:grid-cols-2">
          <Glass className="p-8 flex flex-col items-center gap-6">
            <ScoreBadge label="Technical Score" score={result.technicalScore} />
            <p className="text-center text-xs text-slate-500 max-w-xs">
              Your understanding of algorithms, data structures, and technical
              depth
            </p>
          </Glass>

          <Glass className="p-8 flex flex-col items-center gap-6">
            <ScoreBadge
              label="Communication Score"
              score={result.communicationScore}
              gradientFrom="from-emerald-500"
              gradientTo="to-teal-500"
            />
            <p className="text-center text-xs text-slate-500 max-w-xs">
              Your clarity, articulation, and ability to explain your thinking
            </p>
          </Glass>
        </div>

        {/* ── transcript section ── */}
        <Glass className="p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Your Response
          </p>
          <div className="rounded-lg bg-black/40 p-4 border border-white/5">
            <p className="text-sm leading-relaxed text-slate-300 italic">
              "{result.transcript}"
            </p>
          </div>
        </Glass>

        {/* ── feedback sections ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <FeedbackSection
            title="Strengths"
            items={result.strengths}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentBg="bg-emerald-500/10"
            accentBorder="border-emerald-500/30"
            accentText="text-emerald-300"
            accentIcon="text-emerald-400"
          />

          <FeedbackSection
            title="Weaknesses"
            items={result.weaknesses}
            icon={<AlertCircle className="h-5 w-5" />}
            accentBg="bg-amber-500/10"
            accentBorder="border-amber-500/30"
            accentText="text-amber-300"
            accentIcon="text-amber-400"
          />

          <FeedbackSection
            title="Suggestions"
            items={result.suggestions}
            icon={<Lightbulb className="h-5 w-5" />}
            accentBg="bg-blue-500/10"
            accentBorder="border-blue-500/30"
            accentText="text-blue-300"
            accentIcon="text-blue-400"
          />
        </div>

        {/* ── CTA Row ── */}
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
