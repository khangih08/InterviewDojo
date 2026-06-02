"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@/lib/api/types";
import {
  getAverageScore,
  getScoreTone,
  inferSessionCategory,
} from "@/lib/session-insights";

type DashboardRecentCardProps = {
  sessions: Session[];
  loading: boolean;
  onViewReport?: (sessionId: string) => void;
  limit?: number;
  hideHeader?: boolean;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "PROCESSING":
      return <Clock className="h-4 w-4 text-sky-500" />;
    case "FAILED":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "PROCESSING":
      return "Processing";
    case "FAILED":
      return "Failed";
    default:
      return "Pending";
  }
}

export function DashboardRecentCard({
  sessions,
  loading,
  onViewReport,
  limit = 5,
  hideHeader = false,
}: DashboardRecentCardProps) {
  const router = useRouter();
  const displaySessions = limit ? sessions.slice(0, limit) : sessions;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
      {!hideHeader && (
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                <Clock className="h-3.5 w-3.5" />
              </div>
              Recent Practice Sessions
            </CardTitle>
            <Link
              href="/history"
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
            </Link>
          </div>
        </CardHeader>
      )}

      <CardContent className={hideHeader ? "p-0" : ""}>
        {loading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/40 bg-accent/10 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="min-w-0 space-y-2">
                      <Skeleton className="h-4 w-44 max-w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
            <div className="pt-1 text-center text-sm text-muted-foreground">
              <span>Loading...</span>
            </div>
          </div>
        ) : displaySessions.length > 0 ? (
          <div className="space-y-3 p-4">
            {displaySessions.map((session: any) => {

              // 1. SỬA LỖI 0%: Lấy điểm trực tiếp từ object session. Nếu không có mới gọi hàm tính
              const rawScore = session.score ?? session.evaluation?.overallScore ?? session.evaluation?.score ?? getAverageScore(session) ?? 0;
              const score = Math.round(Number(rawScore)); // Đảm bảo luôn là số nguyên

              const tone = getScoreTone(score);

              // 2. SỬA LỖI CATEGORY: Ưu tiên lấy category/topic thẳng từ backend, không có mới gọi hàm infer
              const category = session.category || session.topic || inferSessionCategory(session.question_content) || "General";

              return (
                <button
                  key={session.id}
                  onClick={() =>
                    onViewReport ? onViewReport(session.id) : router.push("/history")
                  }
                  className="group w-full flex items-center justify-between gap-4 rounded-2xl border border-border/40 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-accent/30 hover:shadow-sm text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {session.question_content?.substring(0, 52) ||
                          "Interview Session"}
                        {session.question_content &&
                        session.question_content.length > 52
                          ? "..."
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="hidden sm:flex rounded-full text-xs">
                      {category}
                    </Badge>
                    {session.status === "COMPLETED" && (
                      <div
                        className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone.surfaceClassName} ${tone.textClassName} ${tone.ringClassName}`}
                      >
                        {score}%
                      </div>
                    )}
                    <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent text-xs">
                      {getStatusLabel(session.status)}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={<Clock className="h-6 w-6" />}
              title="No practice sessions yet"
              description="Start with one interview to populate this panel with recent scores and feedback."
              action={{ label: "Practice now", href: "/interview" }}
              className="border-border/40"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}