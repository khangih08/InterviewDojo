"use client";

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
    sessions,
    completedSessions,
  } = useDashboardData();

  const role = user?.target_role ?? "Frontend Developer";
  const guide = roleDashboard[role] ?? roleDashboard["Frontend Developer"];
  const name = getFirstName(user?.full_name, user?.email);

  return (
    <div className="space-y-6">
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
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <DashboardProgressCard
          loading={loading}
          errorMessage={errorMessage}
          chartData={chartData}
        />
        <DashboardNextActionCard guide={guide} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <DashboardRecentCard sessions={sessions} loading={loading} />
        <DashboardAchievements
          totalSessions={totalSessions}
          avgScore={avgScore}
          completedSessions={completedSessions.length}
        />
      </div>
    </div>
  );
}
