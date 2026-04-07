"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, LayoutDashboard, Target, Zap } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/contexts/auth-context";
import { sessionsApi } from "@/lib/api/sessions";
import type { Session } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RoleGuide = {
  planName: string;
  planLength: string;
  planSummary: string;
  focusTopics: string[];
  mockType: string;
  nextAction: string;
};

const roleDashboard: Record<string, RoleGuide> = {
  "Frontend Developer": {
    planName: "Frontend Interview Track",
    planLength: "2 weeks",
    planSummary: "React, JS, performance, UI tradeoffs.",
    focusTopics: ["React", "JS", "Performance"],
    mockType: "Frontend mock",
    nextAction: "Focus on React + browser questions.",
  },
};

function getAverageScore(session: Session) {
  const technical = session.ai_analysis?.technical_score || 0;
  const communication = session.ai_analysis?.communication_score || 0;
  return Math.round((technical + communication) / 2);
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    sessionsApi
      .getAllSessions()
      .then((data) => {
        if (!isMounted) return;

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setSessions(sorted);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED" && session.ai_analysis,
  );

  const totalSessions = sessions.length;

  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce(
            (acc, session) => acc + getAverageScore(session),
            0,
          ) / completedSessions.length,
        )
      : 0;

  const chartData = completedSessions
    .slice(0, 7)
    .map((session) => ({
      date: new Date(session.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: getAverageScore(session),
    }))
    .reverse();

  const role = user?.target_role ?? "Frontend Developer";
  const guide = roleDashboard[role] ?? roleDashboard["Frontend Developer"];
  const name = (user?.full_name || user?.email || "Candidate").split(" ")[0];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-200">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                Welcome back, {name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/90 sm:text-base">
                Your current track is {guide.planName} ({guide.planLength}).
                {` `}Keep momentum by practicing focused sessions and reviewing
                feedback after each round.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/questions" className="flex items-center gap-2">
                    Practice now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-violet-50">
                  {guide.mockType}
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">
                  Sessions
                </p>
                <p className="mt-1 text-3xl font-bold">{totalSessions}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">
                  Avg Score
                </p>
                <p className="mt-1 text-3xl font-bold">{avgScore}%</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                Progress
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[280px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Loading...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#7c3aed"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <Zap className="mb-2 h-6 w-6 opacity-30" />
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-rose-500" />
                Next Action
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                {guide.nextAction}
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Focus Topics
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {guide.focusTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  {guide.planName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {guide.planSummary}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
