"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Filter,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { sessionsApi } from "@/lib/api/sessions";
import type { Session } from "@/lib/api/types";
import {
  getAverageScore,
  getScoreTone,
  inferSessionCategory,
  type SessionCategory,
} from "@/lib/session-insights";

type DateFilter = "all" | "7d" | "30d" | "90d";

function isWithinRange(date: string, range: DateFilter) {
  if (range === "all") return true;

  const now = Date.now();
  const createdAt = new Date(date).getTime();
  const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

  if (range === "7d") return diffInDays <= 7;
  if (range === "30d") return diffInDays <= 30;
  return diffInDays <= 90;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<SessionCategory | "all">(
    "all",
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    sessionsApi
      .getAllSessions()
      .then((items) =>
        setSessions(
          [...items].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(sessions.map((session) => inferSessionCategory(session.question_content))),
    ).sort();
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sessions.filter((session) => {
      const category = inferSessionCategory(session.question_content);
      const matchesDate = isWithinRange(session.created_at, dateFilter);
      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;
      const matchesQuery =
        !normalizedQuery ||
        session.question_content?.toLowerCase().includes(normalizedQuery) ||
        category.toLowerCase().includes(normalizedQuery);

      return matchesDate && matchesCategory && !!matchesQuery;
    });
  }, [categoryFilter, dateFilter, query, sessions]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#164e63)] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
          <CalendarDays className="h-4 w-4" />
          Session History
        </div>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Review your interview trail
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Filter by date window and topic category, then jump straight into
              any session detail to compare progress over time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold">{sessions.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Showing
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {filteredSessions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Categories
              </p>
              <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search question or category"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </div>

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as SessionCategory | "all",
                )
              }
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-72 max-w-full" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-14 w-24 rounded-2xl" />
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-slate-400">Loading history...</p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-5">
            {filteredSessions.map((session, index) => {
              const score = getAverageScore(session);
              const tone = getScoreTone(score);
              const category = inferSessionCategory(session.question_content);

              return (
                <div key={session.id} className="relative pl-8">
                  {index < filteredSessions.length - 1 && (
                    <div className="absolute left-3.25 top-9 h-[calc(100%+0.75rem)] w-px bg-slate-200" />
                  )}
                  <div className="absolute left-0 top-5 h-7 w-7 rounded-full border border-slate-200 bg-white shadow-sm" />

                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="rounded-full">
                            {category}
                          </Badge>
                          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                            {session.status}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(session.created_at).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-slate-950">
                            {session.question_content || "Interview session"}
                          </h2>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {session.ai_analysis?.feedback ||
                              "Open session details to review transcript and feedback."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div
                          className={`rounded-2xl px-4 py-3 ring-1 ${tone.surfaceClassName} ${tone.textClassName} ${tone.ringClassName}`}
                        >
                          <p className="text-xs uppercase tracking-[0.2em]">
                            Score
                          </p>
                          <p className="mt-1 text-2xl font-bold">
                            {session.status === "COMPLETED" ? `${score}%` : "--"}
                          </p>
                        </div>

                        <Button asChild variant="ghost" className="rounded-full">
                          <Link href={`/result?sessionId=${session.id}`}>
                            View result <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Clock className="h-10 w-10 opacity-25" />}
            title="No sessions match the current filters"
            description="Try a wider date range or switch to another category."
            action={{
              label: "Reset filters",
              onClick: () => {
                setQuery("");
                setDateFilter("all");
                setCategoryFilter("all");
              },
            }}
            className="border-slate-200"
          />
        )}
      </section>
    </div>
  );
}
