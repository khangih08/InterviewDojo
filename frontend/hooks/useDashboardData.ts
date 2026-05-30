"use client";

import { useEffect, useMemo, useState } from "react";
import { sessionsApi } from "@/lib/api/sessions";
import type { Session } from "@/lib/api/types";
import {
  getAverageScore,
  inferSessionCategory,
  type SessionCategory,
} from "@/lib/session-insights";

export type ChartPoint = {
  date: string;
  score: number;
};

export type CategoryPoint = {
  category: SessionCategory;
  sessions: number;
};

export type StatusPoint = {
  label: string;
  value: number;
};

export type DashboardDataState = {
  loading: boolean;
  errorMessage: string | null;
  sessions: Session[];
  completedSessions: Session[];
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  chartData: ChartPoint[];
  categoryData: CategoryPoint[];
  statusData: StatusPoint[];
  latestScoreDelta: number;
};

// [CẬP NHẬT]: Thêm userId vào để fetch đúng dữ liệu của user đang đăng nhập
export function useDashboardData(userId?: string): DashboardDataState {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Nếu chưa có userId thì chưa gọi API vội
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage(null);

        // [CẬP NHẬT]: Truyền userId vào hàm fetch
        const data = await sessionsApi.getAllSessions(userId);
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
  }, [userId]); // [CẬP NHẬT]: Chạy lại khi userId thay đổi

  const completedSessions = useMemo(
    // [CẬP NHẬT]: Backend NestJS có thể dùng trường final_report hoặc status thay vì ai_analysis
    () => sessions.filter((s) => s.status === "COMPLETED"),
    [sessions],
  );

  const totalSessions = sessions.length;

  const avgScore = useMemo(() => {
    if (!completedSessions.length) return 0;
    const total = completedSessions.reduce(
      (acc, s) => acc + (s.average_score || getAverageScore(s)), // Dùng average_score từ backend NestJS nếu có
      0,
    );
    return Math.round(total / completedSessions.length);
  }, [completedSessions]);

  const bestScore = useMemo(() => {
    if (!completedSessions.length) return 0;
    return Math.max(...completedSessions.map((s) => s.average_score || getAverageScore(s)));
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
          score: s.average_score || getAverageScore(s),
        }))
        .reverse(),
    [completedSessions],
  );

  const categoryData = useMemo<CategoryPoint[]>(() => {
    const counts = new Map<SessionCategory, number>();

    for (const session of sessions) {
      // Dùng job_title từ backend thay cho question_content nếu có
      const contentToAnalyze = session.job_title || session.question_content || "";
      const category = inferSessionCategory(contentToAnalyze as any);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([category, sessionsCount]) => ({
        category,
        sessions: sessionsCount,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);
  }, [sessions]);

  const statusData = useMemo<StatusPoint[]>(
    () => [
      {
        label: "Completed",
        value: sessions.filter((session) => session.status === "COMPLETED")
          .length,
      },
      {
        label: "Processing",
        value: sessions.filter((session) => session.status === "PROCESSING" || session.status === "IN_PROGRESS")
          .length,
      },
      {
        label: "Pending",
        value: sessions.filter((session) => session.status === "PENDING").length,
      },
      {
        label: "Failed",
        value: sessions.filter((session) => session.status === "FAILED").length,
      },
    ],
    [sessions],
  );

  const latestScoreDelta = useMemo(() => {
    if (completedSessions.length < 2) return 0;
    const score1 = completedSessions[0].average_score || getAverageScore(completedSessions[0]);
    const score2 = completedSessions[1].average_score || getAverageScore(completedSessions[1]);
    return score1 - score2;
  }, [completedSessions]);

  return {
    loading,
    errorMessage,
    sessions,
    completedSessions,
    totalSessions,
    avgScore,
    bestScore,
    chartData,
    categoryData,
    statusData,
    latestScoreDelta,
  };
}