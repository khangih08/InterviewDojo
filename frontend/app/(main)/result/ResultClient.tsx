"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import EvaluationReport from "@/components/interview/EvaluationReport";

export default function InterviewResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      if (!sessionIdFromUrl) {
        setLoading(false);
        setErrorMessage("Không tìm thấy ID phiên phỏng vấn trong đường dẫn.");
        return;
      }

      try {
        setLoading(true);
        // [CẬP NHẬT] Gọi ĐÚNG endpoint chuyên lấy báo cáo của NestJS
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        const response = await fetch(`${API_BASE}/interviews/${sessionIdFromUrl}/report`);

        if (!response.ok) {
          throw new Error("Không thể tải báo cáo từ máy chủ.");
        }

        const data = await response.json();

        // Gắn dữ liệu nhận được vào state. Vì ta đã bỏ bọc 'dashboard' ở backend,
        // data lúc này chính là { avgScore, theory, coding, softSkills, radarData... }
        setReportData({
          avgScore: data.avgScore || 0,
          theory: data.theory || 0,
          coding: data.coding || 0,
          softSkills: data.softSkills || 0,
          summary: data.summary || "AI không để lại đánh giá chi tiết nào cho phiên này.",
          radarData: data.radarData || [0, 0, 0, 0, 0]
        });

      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Có lỗi khi tải dữ liệu phỏng vấn.");
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [sessionIdFromUrl]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 p-8">
        <div className="flex flex-col items-center gap-4 text-cyan-400">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Đang tổng hợp báo cáo...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !reportData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 p-8">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-amber-500" />}
          title="Không thể tải báo cáo"
          description={errorMessage ?? "Truy xuất dữ liệu thất bại."}
          action={{ label: "Quay lại Lịch sử", onClick: () => router.push("/history") }}
          className="border-slate-800 bg-[#0f172a] text-slate-200"
        />
      </div>
    );
  }

  return (
    <EvaluationReport
      report={reportData}
      setReport={() => router.back()}
    />
  );
}