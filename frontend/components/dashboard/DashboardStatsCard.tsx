import { TrendingUp, Zap, Award, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatsCardProps = {
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  latestScoreDelta: number;
};

export function DashboardStatsCard({
  totalSessions,
  avgScore,
  bestScore,
  latestScoreDelta,
}: DashboardStatsCardProps) {
  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      note: totalSessions === 1 ? "first session logged" : "sessions completed",
      icon: Zap,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      ringColor: "ring-cyan-100",
    },
    {
      label: "Average Score",
      value: `${avgScore}%`,
      note:
        latestScoreDelta === 0
          ? "steady from last attempt"
          : `${latestScoreDelta > 0 ? "+" : ""}${latestScoreDelta} vs last session`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      ringColor: "ring-indigo-100",
    },
    {
      label: "Best Score",
      value: `${bestScore}%`,
      note: bestScore >= 80 ? "high-confidence answer quality" : "room to raise the ceiling",
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      ringColor: "ring-amber-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, note, icon: Icon, color, bgColor, ringColor }) => (
        <Card
          key={label}
          className={cn(
            "overflow-hidden border border-slate-200/80 bg-white/90 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg",
            ringColor,
          )}
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-slate-600">{label}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-2 max-w-[18rem] text-sm text-slate-500">
                  {note}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3 py-2 ring-1",
                  bgColor,
                  ringColor,
                )}
              >
                <Icon className={`h-6 w-6 ${color}`} />
                <ArrowUpRight className={`h-4 w-4 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
