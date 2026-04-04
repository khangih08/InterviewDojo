"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  LayoutDashboard,
  Mic,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const roleDashboard: Record<
  string,
  {
    planName: string;
    planLength: string;
    planSummary: string;
    focusTopics: string[];
    mockType: string;
    nextAction: string;
  }
> = {
  "Backend Developer": {
    planName: "Backend Interview Track",
    planLength: "2 weeks",
    planSummary:
      "APIs, databases, caching, scalability, and debugging tradeoffs.",
    focusTopics: ["REST API", "PostgreSQL", "Caching", "System Design"],
    mockType: "Backend technical mock",
    nextAction: "Practice backend and database questions first.",
  },
  "Frontend Developer": {
    planName: "Frontend Interview Track",
    planLength: "2 weeks",
    planSummary:
      "JavaScript, React, browser behavior, performance, and UI tradeoffs.",
    focusTopics: ["JavaScript", "React", "Performance", "State Management"],
    mockType: "Frontend technical mock",
    nextAction: "Warm up with React and browser questions.",
  },
  "Fullstack Developer": {
    planName: "Fullstack Interview Track",
    planLength: "3 weeks",
    planSummary:
      "End-to-end delivery, contracts, integration, and architecture choices.",
    focusTopics: ["Architecture", "Frontend", "Backend", "APIs"],
    mockType: "Mixed stack mock",
    nextAction: "Alternate between frontend and backend sets.",
  },
  "AI Engineer": {
    planName: "AI Engineer Interview Track",
    planLength: "3 weeks",
    planSummary:
      "Evaluation, pipelines, ML systems, deployment, and applied tradeoffs.",
    focusTopics: ["ML Systems", "Evaluation", "Data Quality", "Deployment"],
    mockType: "AI system mock",
    nextAction: "Review ML systems and evaluation scenarios.",
  },
};

const experienceCopy: Record<string, string> = {
  intern: "Build confidence through fundamentals and short practice sets.",
  fresher: "Focus on core concepts, communication, and structured answers.",
  junior:
    "Show consistent execution and explain your implementation choices clearly.",
  middle:
    "Practice tradeoffs, ownership stories, and stronger system reasoning.",
  senior: "Lead with architecture decisions, mentoring, and impact stories.",
};

const dailyChecklist = [
  { label: "Solve 3 focused questions in your target role.", done: false },
  { label: "Do 1 timed mock or a partial interview simulation.", done: false },
  {
    label: "Write down 1 mistake you do not want to repeat tomorrow.",
    done: false,
  },
];

const prepKits = [
  {
    icon: Zap,
    title: "Quick Warm-up",
    subtitle: "15–20 min",
    description:
      "A short set to get into interview mode before a deeper session.",
    href: "/questions",
    cta: "Open warm-up",
    accent: "from-amber-50 to-orange-50",
    iconColor: "text-amber-500",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: BookOpen,
    title: "Core Interview Set",
    subtitle: "45–60 min",
    description:
      "A focused question block designed for your current target role.",
    href: "/questions",
    cta: "Practice now",
    accent: "from-violet-50 to-indigo-50",
    iconColor: "text-violet-500",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    icon: Mic,
    title: "Mock Interview",
    subtitle: "60 min",
    description:
      "Simulate the real interview flow and train under mild pressure.",
    href: "/interview",
    cta: "Start mock",
    accent: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-500",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  const role = user?.target_role ?? "Frontend Developer";
  const experience = user?.experience_level ?? "fresher";
  const name = (user?.full_name || user?.email || "Candidate").split(" ")[0];
  const guide = roleDashboard[role] ?? roleDashboard["Frontend Developer"];

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-8 text-white shadow-xl shadow-violet-200">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-10 right-32 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-200">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Interview Prep Hub
            </div>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              Welcome back, {name} 👋
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-violet-200">
              Your personalised study plan is ready. Stay consistent — small
              daily reps beat last-minute cramming every time.
            </p>

            {/* tags */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Target, label: role },
                { icon: Flame, label: experience },
                { icon: Clock, label: "3 questions + 1 mock today" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                >
                  <Icon className="h-3 w-3 opacity-80" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-white font-semibold text-violet-700 shadow-md hover:bg-violet-50"
              >
                <Link href="/questions" className="flex items-center gap-2">
                  Continue Practice <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Link href="/interview">Start Mock Interview</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Study Plan + Priority ── */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Study Plan */}
          <Card className="overflow-hidden border-0 shadow-md shadow-zinc-100 lg:col-span-2">
            <CardHeader className="border-b border-zinc-100 bg-white pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-zinc-900">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Study Plan
                </CardTitle>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  In Progress
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 bg-white p-6">
              {/* plan info */}
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
                <p className="text-lg font-bold text-zinc-900">
                  {guide.planName}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {guide.planLength} · {guide.planSummary}
                </p>
              </div>

              {/* topics */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Focus Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.focusTopics.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-violet-200 bg-white px-3.5 py-1 text-xs font-medium text-violet-700 shadow-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card className="border-0 shadow-md shadow-zinc-100">
            <CardHeader className="border-b border-zinc-100 bg-white pb-4">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <Target className="h-4 w-4 text-rose-500" />
                Current Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white p-6">
              <p className="text-sm leading-relaxed text-zinc-600">
                {experienceCopy[experience] ??
                  "Focus on role-fit practice and structured answers."}
              </p>
              <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <Zap className="h-3.5 w-3.5" /> Next Best Step
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  {guide.nextAction}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Prep Kits ── */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Prep Kits
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {prepKits.map(
              ({
                icon: Icon,
                title,
                subtitle,
                description,
                href,
                cta,
                accent,
                iconColor,
                badgeColor,
              }) => (
                <Card
                  key={title}
                  className="group border-0 shadow-md shadow-zinc-100 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent
                    className={`rounded-2xl bg-gradient-to-br p-6 ${accent}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`rounded-xl bg-white p-2.5 shadow-sm ${iconColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColor}`}
                      >
                        {subtitle}
                      </span>
                    </div>
                    <p className="mt-4 text-base font-bold text-zinc-900">
                      {title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                      {description}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-5 w-full rounded-full border-zinc-200 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50 group-hover:border-violet-300 group-hover:text-violet-700"
                    >
                      <Link
                        href={href}
                        className="flex items-center justify-center gap-2"
                      >
                        {cta} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>

        {/* ── Checklist + Mock Rec ── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Checklist */}
          <Card className="border-0 shadow-md shadow-zinc-100">
            <CardHeader className="border-b border-zinc-100 bg-white pb-4">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Today&apos;s Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 bg-white p-6">
              {dailyChecklist.map(({ label, done }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3.5 transition-colors hover:bg-violet-50/50"
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                  )}
                  <span
                    className={`text-sm leading-relaxed ${done ? "text-zinc-400 line-through" : "text-zinc-700"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mock Rec */}
          <Card className="border-0 shadow-md shadow-zinc-100">
            <CardHeader className="border-b border-zinc-100 bg-white pb-4">
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <Mic className="h-4 w-4 text-violet-500" />
                Mock Interview Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between gap-5 bg-white p-6">
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                  Recommended Format
                </p>
                <p className="mt-2 text-base font-semibold text-zinc-900">
                  {guide.mockType}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  60 min · Simulated pressure · Role-specific questions
                </p>
              </div>
              <Button
                asChild
                className="w-full rounded-full bg-violet-600 font-semibold text-white shadow-md shadow-violet-200 hover:bg-violet-700"
              >
                <Link
                  href="/interview"
                  className="flex items-center justify-center gap-2"
                >
                  Go to Mock Interview <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
