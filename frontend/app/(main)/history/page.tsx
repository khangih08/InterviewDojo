"use client";

import { useEffect, useState } from "react";
import { sessionsApi } from "@/lib/api/sessions";
import { Session } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Clock, Loader2 } from "lucide-react";

function getAverageScore(session: Session) {
  if (!session.ai_analysis) return null;

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

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
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
          error instanceof Error ? error.message : "Unable to load session history.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Practice History</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Review your past performances and AI feedback.
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-zinc-400">
            <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin" />
            <p>Loading session history...</p>
          </div>
        ) : errorMessage ? (
          <div className="py-20 px-6 text-center text-rose-500">
            <p>{errorMessage}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No interview sessions recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Question
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500 text-center">
                  Avg Score
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sessions.map((session) => {
                const averageScore = getAverageScore(session);
                const canViewResult = session.status === "COMPLETED";

                return (
                  <tr
                    key={session.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {new Date(session.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-zinc-900 max-w-[300px] truncate">
                        {session.question_content || "Technical Question"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className="rounded-full px-2.5 py-0.5 font-medium"
                        variant={
                          session.status === "COMPLETED" ? "default" : "secondary"
                        }
                      >
                        {session.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-bold ${
                          averageScore !== null ? "text-violet-600" : "text-zinc-300"
                        }`}
                      >
                        {averageScore !== null ? `${averageScore}%` : "--"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canViewResult ? (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                        >
                          <Link href={`/result?sessionId=${session.id}`}>
                            Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-sm text-zinc-400">Not ready</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
