"use client";

import { useEffect, useMemo, useState } from "react";
import { sessionsApi } from "@/lib/api/sessions";
import type { Session } from "@/lib/api/types";

export type ChartPoint = {
  date: string;
  score: number;
};

export type DashboardDataState = {
  loading: boolean;
  errorMessage: string | null;
  sessions: Session[];
  completedSessions: Session[];
  totalSessions: number;
  avgScore: number;
  bestScore: number;
};

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getAverageScore(session: Session) {
  if (!session.ai_analysis) return 0;
  const technical = clampScore(session.ai_analysis.technical_score ?? 0);
  const communication = clampScore(
    session.ai_analysis.communication_score ?? 0,
  );
  return Math.round((technical + communication) / 2);
}

export function useDashboardData(): DashboardDataState {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const data = await sessionsApi.getAllSessions();
        if (cancelled) return;

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setSessions(sorted);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Cannot load sessions.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED" && !!s.ai_analysis),
    [sessions],
  );

  const totalSessions = sessions.length;

  const avgScore = useMemo(() => {
    if (!completedSessions.length) return 0;
    const total = completedSessions.reduce(
      (acc, s) => acc + getAverageScore(s),
      0,
    );
    return Math.round(total / completedSessions.length);
  }, [completedSessions]);

  const bestScore = useMemo(() => {
    if (!completedSessions.length) return 0;
    return Math.max(...completedSessions.map((s) => getAverageScore(s)));
  }, [completedSessions]);

  const chartData = useMemo<ChartPoint[]>(
    () =>
      completedSessions
        .slice(0, 7)
        .map((s) => ({
          date: new Date(s.created_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
          score: getAverageScore(s),
        }))
        .reverse(),
    [completedSessions],
  );

  return {
    loading,
    errorMessage,
    sessions,
    completedSessions,
    totalSessions,
    avgScore,
    bestScore,
  };
}
