"use client";

import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/lib/api/types";

type DashboardRecentCardProps = {
  sessions: Session[];
  loading: boolean;
};

function getAverageScore(session: Session) {
  if (!session.ai_analysis) return 0;
  const technical = Math.max(
    0,
    Math.min(100, session.ai_analysis.technical_score ?? 0),
  );
  const communication = Math.max(
    0,
    Math.min(100, session.ai_analysis.communication_score ?? 0),
  );
  return Math.round((technical + communication) / 2);
}

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "PROCESSING":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "FAILED":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-indigo-500" />
          Recent Sessions
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getStatusIcon(session.status)}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {session.question_content?.substring(0, 40) ||
                        "Interview Session"}
                      {session.question_content &&
                      session.question_content.length > 40
                        ? "..."
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.status === "COMPLETED" && (
                    <span className="text-sm font-bold text-purple-600">
                      {getAverageScore(session)}%
                    </span>
                  )}
                  <Badge className={getStatusColor(session.status)}>
                    {session.status === "COMPLETED"
                      ? "Hoàn thành"
                      : session.status === "PROCESSING"
                        ? "Đang xử lý"
                        : "Thất bại"}
                  </Badge>
                </div>
              </div>
            ))}
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
