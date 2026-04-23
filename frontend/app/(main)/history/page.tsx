"use client";

import { ArrowRight } from "lucide-react";
import { sessionsApi } from "@/lib/api/sessions";
import { Session } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function HistoryPage() {
  const { hydrated, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!isAuthenticated) {
      setSessions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSessions() {
      try {
        setLoading(true);
        const data = await sessionsApi.getAllSessions();
        if (!cancelled) {
          setSessions(data);
        }
      } catch {
        if (!cancelled) {
          setSessions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Practice History</h1>
          <p className="text-zinc-500 mt-1 text-sm">Review your past performances and AI feedback.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500">Date</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500">Question</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500 text-center">Score</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-600">
                  {new Date(session.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-zinc-900 max-w-[300px] truncate">
                    {session.question_content || "Technical Question"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    className="rounded-full px-2.5 py-0.5 font-medium"
                    variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}
                  >
                    {session.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${session.ai_analysis ? 'text-violet-600' : 'text-zinc-300'}`}>
                    {session.ai_analysis?.technical_score ?? '--'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button asChild variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                    <Link href={`/result?sessionId=${session.id}`}>
                      Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sessions.length === 0 && !loading && (
          <div className="py-20 text-center text-zinc-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No interview sessions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
