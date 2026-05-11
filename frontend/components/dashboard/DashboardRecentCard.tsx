"use client";

import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Session } from "@/lib/api/types";
import {
  getAverageScore,
  getScoreTone,
  inferSessionCategory,
} from "@/lib/session-insights";

type DashboardRecentCardProps = {
  sessions: Session[];
  loading: boolean;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "PROCESSING":
      return <Clock className="h-4 w-4 text-sky-500" />;
    case "FAILED":
      return <AlertCircle className="h-4 w-4 text-rose-500" />;
    default:
      return <Clock className="h-4 w-4 text-slate-400" />;
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
}: DashboardRecentCardProps) {
  const recentSessions = sessions.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-indigo-500" />
            Recent Sessions
          </CardTitle>
          <Link
            href="/history"
            className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const score = getAverageScore(session);
              const tone = getScoreTone(score);
              const category = inferSessionCategory(session.question_content);

              return (
                <Link
                  key={session.id}
                  href={`/result?sessionId=${session.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {session.question_content?.substring(0, 52) ||
                          "Interview Session"}
                        {session.question_content &&
                        session.question_content.length > 52
                          ? "..."
                          : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(session.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full">
                      {category}
                    </Badge>
                    {session.status === "COMPLETED" && (
                      <div
                        className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone.surfaceClassName} ${tone.textClassName} ${tone.ringClassName}`}
                      >
                        {score}%
                      </div>
                    )}
                    <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {getStatusLabel(session.status)}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-gray-400">
            <Clock className="mb-2 h-6 w-6 opacity-30" />
            <p className="text-sm">No sessions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
