"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  DashboardHero,
  roleDashboard,
} from "@/components/dashboard/DashboardHero";
import { DashboardNextActionCard } from "@/components/dashboard/DashboardNextActionCard";
import { DashboardProgressCard } from "@/components/dashboard/DashboardProgressCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import { DashboardRecentCard } from "@/components/dashboard/DashboardRecentCard";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { ReportModal } from "@/components/interview/ReportModal"; // [THÊM MỚI]: Import Modal

function getFirstName(fullName?: string, email?: string) {
  return (fullName || email || "Candidate").split(" ")[0];
}

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    loading,
    errorMessage,
    totalSessions,
    avgScore,
    bestScore,
    chartData,
    categoryData,
    statusData,
    latestScoreDelta,
    sessions,
    completedSessions,
  } = useDashboardData(user?.id);

  // [THÊM MỚI]: State quản lý việc mở Modal Báo Cáo
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // [THÊM MỚI]: Hàm xử lý khi click "Xem báo cáo"
  const handleViewReport = (id: string) => {
    setSelectedSessionId(id);
    setIsModalOpen(true);
  };

  const role = user?.target_role ?? "Frontend Developer";
  const guide = roleDashboard[role] ?? roleDashboard["Frontend Developer"];
  const name = getFirstName(user?.full_name, user?.email);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <DashboardHero
        name={name}
        guide={guide}
        totalSessions={totalSessions}
        avgScore={avgScore}
      />

      <DashboardStatsCard
        totalSessions={totalSessions}
        avgScore={avgScore}
        bestScore={bestScore}
        latestScoreDelta={latestScoreDelta}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <DashboardProgressCard
          loading={loading}
          errorMessage={errorMessage}
          chartData={chartData}
          categoryData={categoryData}
          statusData={statusData}
        />
       <DashboardNextActionCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* [CẬP NHẬT]: Thêm prop onViewReport và limit cho DashboardRecentCard */}
        <DashboardRecentCard
          sessions={sessions}
          loading={loading}
          limit={5}
          onViewReport={handleViewReport}
        />
        <DashboardAchievements
          totalSessions={totalSessions}
          avgScore={avgScore}
          completedSessions={completedSessions.length}
        />
      </div>

      {/* [THÊM MỚI]: Nhúng Component Modal vào trang Dashboard */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionId={selectedSessionId}
      />
    </div>
  );
}