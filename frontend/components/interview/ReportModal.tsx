"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, X, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation"; // Thêm router
import { EmptyState } from "@/components/ui/empty-state";
import EvaluationReport from "@/components/interview/EvaluationReport";
import { Button } from "@/components/ui/button";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export function ReportModal({ isOpen, onClose, sessionId }: ReportModalProps) {
  const router = useRouter();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      if (!isOpen || !sessionId) return;
      try {
        setLoading(true);
        setErrorMessage(null);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${API_BASE}/interviews/${sessionId}/report`);
        if (!response.ok) throw new Error("Không thể tải báo cáo từ máy chủ.");
        const data = await response.json();

        setReportData({
          avgScore: data.avgScore || 0,
          theory: data.theory || 0,
          coding: data.coding || 0,
          softSkills: data.softSkills || 0,
          summary: data.summary || "AI không để lại đánh giá chi tiết nào cho phiên này.",
          radarData: data.radarData || [0, 0, 0, 0, 0]
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Có lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [isOpen, sessionId]);

  const handleGoToTranscript = () => {
    if (sessionId) {
      router.push(`/interview/${sessionId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-[#0f172a] shadow-2xl custom-scrollbar flex flex-col">

        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-slate-800/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-2 sm:p-6 flex-1">
          {loading ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-cyan-400">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Đang tổng hợp báo cáo...</p>
            </div>
          ) : errorMessage || !reportData ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <EmptyState
                icon={<AlertCircle className="h-12 w-12 text-amber-500" />}
                title="Không thể tải báo cáo"
                description={errorMessage ?? "Truy xuất dữ liệu thất bại."}
                action={{ label: "Đóng", onClick: onClose }}
                className="border-none bg-transparent text-slate-200"
              />
            </div>
          ) : (
            <>
              <EvaluationReport
                report={reportData}
                setReport={onClose}
              />

              {/* Nút Xem lại biên bản chat */}
              <div className="px-6 pb-8 -mt-4 flex justify-center">
                <Button
                  onClick={handleGoToTranscript}
                  variant="outline"
                  className="rounded-2xl border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all gap-2 py-6 px-8"
                >
                  <MessageSquareText size={20} />
                  Xem lại toàn bộ biên bản phỏng vấn chi tiết
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}