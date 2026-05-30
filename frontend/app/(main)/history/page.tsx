"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, Filter, Search } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { sessionsApi } from "@/lib/api/sessions";
import type { Session } from "@/lib/api/types";
import { getScoreTone, inferSessionCategory, type SessionCategory } from "@/lib/session-insights";

// [THÊM MỚI]: Import Modal báo cáo
import { ReportModal } from "@/components/interview/ReportModal";

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
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<SessionCategory | "all">("all");
  const [query, setQuery] = useState("");

  // [THÊM MỚI]: State quản lý Modal
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    sessionsApi
      .getAllSessions(user.id)
      .then((items) =>
        setSessions(
          [...items].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      )
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(sessions.map((session) => inferSessionCategory(session.job_title || session.question_content || "")))
    ).sort();
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sessions.filter((session) => {
      const category = inferSessionCategory(session.job_title || session.question_content || "");
      const matchesDate = isWithinRange(session.created_at, dateFilter);
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;

      const sessionTitle = session.job_title || session.question_content || "";
      const matchesQuery =
        !normalizedQuery ||
        sessionTitle.toLowerCase().includes(normalizedQuery) ||
        category.toLowerCase().includes(normalizedQuery);

      return matchesDate && matchesCategory && !!matchesQuery;
    });
  }, [categoryFilter, dateFilter, query, sessions]);

  // [THÊM MỚI]: Hàm xử lý mở báo cáo
  const handleViewReport = (id: string) => {
    setSelectedSessionId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* 1. Phần Header Card (Giữ nguyên giao diện đẹp của bạn) */}
      <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#164e63)] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
          <CalendarDays className="h-4 w-4" />
          Lịch sử phỏng vấn
        </div>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hành trình của bạn</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Xem lại các phiên phỏng vấn và đánh giá sự tiến bộ qua thời gian.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Tổng cộng</p>
              <p className="mt-2 text-2xl font-semibold">{sessions.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Hiển thị</p>
              <p className="mt-2 text-2xl font-semibold">{filteredSessions.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Nhóm ngành</p>
              <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bộ lọc (Giữ nguyên logic filter của bạn) */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm vị trí phỏng vấn..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Bộ lọc
            </div>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">90 ngày qua</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as SessionCategory | "all")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="all">Tất cả lĩnh vực</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. Danh sách hiển thị (Thay đổi logic Link sang handleViewReport) */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="space-y-4 py-10 text-center text-sm text-slate-400">Đang tải lịch sử...</div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-5">
            {filteredSessions.map((session, index) => {
              const score = session.average_score || 0;
              const tone = getScoreTone(score);
              const category = inferSessionCategory(session.job_title || session.question_content || "");

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
                          <Badge variant="outline" className="rounded-full">{category}</Badge>
                          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{session.status}</Badge>
                          <span className="text-xs text-slate-400">{new Date(session.created_at).toLocaleString("vi-VN")}</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-950">
                            Vị trí: {session.job_title || session.question_content || "Phỏng vấn AI"}
                          </h2>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 line-clamp-2">
                            {session.final_report || "Bấm xem báo cáo để nhận đánh giá chi tiết từ AI."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div className={`rounded-2xl px-4 py-3 ring-1 ${tone.surfaceClassName} ${tone.textClassName} ${tone.ringClassName}`}>
                          <p className="text-xs uppercase tracking-[0.2em]">Điểm</p>
                          <p className="mt-1 text-2xl font-bold">{session.status === "COMPLETED" ? `${score}%` : "--"}</p>
                        </div>

                        {/* [CẬP NHẬT]: Đổi Link thành Button có onClick */}
                        <Button
                          variant="ghost"
                          className="rounded-full hover:bg-slate-100"
                          onClick={() => handleViewReport(session.id)}
                        >
                          Xem báo cáo <ArrowRight className="ml-1.5 h-4 w-4" />
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
            title="Không tìm thấy phiên phỏng vấn nào"
            description="Thử thay đổi bộ lọc hoặc bắt đầu một bài phỏng vấn mới."
            action={{
              label: "Xóa bộ lọc",
              onClick: () => { setQuery(""); setDateFilter("all"); setCategoryFilter("all"); },
            }}
            className="border-slate-200"
          />
        )}
      </section>

      {/* [THÊM MỚI]: Modal hiển thị báo cáo */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionId={selectedSessionId}
      />
    </div>
  );
}