"use client";

import Link from "next/link";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  "Solve 3 focused questions in your target role.",
  "Do 1 timed mock or a partial interview simulation.",
  "Write down 1 mistake you do not want to repeat tomorrow.",
];

const prepKits = [
  {
    title: "Quick Warm-up",
    subtitle: "15-20 min",
    description:
      "A short set to get into interview mode before a deeper session.",
    href: "/questions",
    cta: "Open warm-up",
  },
  {
    title: "Core Interview Set",
    subtitle: "45-60 min",
    description:
      "A focused question block designed for your current target role.",
    href: "/questions",
    cta: "Practice now",
  },
  {
    title: "Mock Interview",
    subtitle: "60 min",
    description:
      "Simulate the real interview flow and train under mild pressure.",
    href: "/interview",
    cta: "Start mock",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const role = user?.target_role ?? "Frontend Developer";
  const experience = user?.experience_level ?? "fresher";
  const name = user?.full_name || user?.email || "Candidate";
  const guide = roleDashboard[role] ?? roleDashboard["Frontend Developer"];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-6 shadow-sm shadow-zinc-200/70">
        <div className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
          Interview prep hub
        </div>
        <h2 className="mt-3 text-3xl font-bold text-zinc-950">
          Welcome back, {name}
        </h2>
        <div className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Dashboard này được thiết kế theo kiểu các platform luyện tập như
          LeetCode/HackerRank: ít số liệu trang trí, nhiều “study plan”, “prep
          kit”, và “next step” để bạn vào bài ngay.
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
            Role: {role}
          </span>
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
            Level: {experience}
          </span>
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
            Today target: 3 questions + 1 mock
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            <Link href="/questions">Continue practice</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-violet-200 text-violet-700 hover:bg-violet-50"
          >
            <Link href="/interview">Start mock interview</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-950">Study plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-4">
              <div>
                <p className="text-base font-semibold text-zinc-950">
                  {guide.planName}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {guide.planLength} · {guide.planSummary}
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                In progress
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-950">Focus topics</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {guide.focusTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70">
          <CardHeader>
            <CardTitle className="text-zinc-950">Current priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-zinc-600">
              {experienceCopy[experience] ??
                "Focus on role-fit practice and structured answers."}
            </p>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-sm font-medium text-violet-700">
                Next best step
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-700">
                {guide.nextAction}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {prepKits.map((kit) => (
          <Card
            key={kit.title}
            className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-zinc-950">{kit.title}</CardTitle>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                  {kit.subtitle}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-zinc-600">
                {kit.description}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Link href={kit.href}>{kit.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70">
          <CardHeader>
            <CardTitle className="text-zinc-950">
              Today&apos;s preparation checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-zinc-700">
              {dailyChecklist.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70">
          <CardHeader>
            <CardTitle className="text-zinc-950">
              Mock interview recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-950">
                Recommended format
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {guide.mockType}
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-violet-600 text-white hover:bg-violet-700"
            >
              <Link href="/interview">Go to mock interview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
