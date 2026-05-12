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
}: DashboardRecentCardProps) {
  const recentSessions = sessions.slice(0, 5);

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
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

      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <span>Loading...</span>
            </div>
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
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border/40 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-accent/30 hover:shadow-sm"
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
                        {new Date(session.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full text-xs">
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
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <Clock className="mb-2 h-6 w-6 opacity-30" />
            <p className="text-sm">No practice sessions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
