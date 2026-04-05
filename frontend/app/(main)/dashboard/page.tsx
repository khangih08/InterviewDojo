"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { sessionsApi } from "@/lib/api/sessions";
import { Session } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  ArrowRight,
  LayoutDashboard,
  Target,
  Flame,
  Zap,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────

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
  "Frontend Developer": {
    planName: "Frontend Interview Track",
    planLength: "2 weeks",
    planSummary: "React, JS, performance, UI tradeoffs.",
    focusTopics: ["React", "JS", "Performance"],
    mockType: "Frontend mock",
    nextAction: "Focus on React + browser questions.",
  },
};

// ─── COMPONENT ─────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsApi
      .getAllSessions()
      .then((data) => {
        // sort mới nhất lên trước
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        setSessions(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ─── CALCULATIONS ────────────────────────────────────

  const completedSessions = sessions.filter(
    (s) => s.status === "COMPLETED" && s.ai_analysis
  );

  const totalSessions = sessions.length;

  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce(
            (acc, s) =>
              acc +
              ((s.ai_analysis?.technical_score || 0) +
                (s.ai_analysis?.communication_score || 0)) /
                2,
            0
          ) / completedSessions.length
        )
      : 0;

  // chart (7 session gần nhất)
  const chartData = completedSessions
    .slice(0, 7)
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: Math.round(
        ((s.ai_analysis?.technical_score || 0) +
          (s.ai_analysis?.communication_score || 0)) /
          2
      ),
    }))
    .reverse();

  // ─── USER INFO ──────────────────────────────────────

  const role = user?.target_role ?? "Frontend Developer";
  const name = (user?.full_name || user?.email || "Candidate").split(" ")[0];
  const guide = roleDashboard[role] ?? roleDashboard["Frontend Developer"];

  // ─── UI ─────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── HERO ── */}
        <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 text-xs uppercase text-violet-200">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Welcome back, {name} 👋
          </h1>

          {/* Stats */}
          <div className="mt-6 flex gap-8">
            <div>
              <p className="text-xs text-violet-200">Sessions</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </div>

            <div>
              <p className="text-xs text-violet-200">Avg Score</p>
              <p className="text-2xl font-bold">{avgScore}%</p>
            </div>
          </div>

          <div className="mt-6">
            <Button asChild className="bg-white text-violet-700">
              <Link href="/questions" className="flex items-center gap-2">
                Practice <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── CHART ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              Progress
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[250px]">
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

        {/* ── NEXT ACTION ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-rose-500" />
              Next Action
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              {guide.nextAction}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}