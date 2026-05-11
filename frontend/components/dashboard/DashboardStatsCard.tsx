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
      gradient: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-500/15",
    },
    {
      label: "Average Score",
      value: `${avgScore}%`,
      note:
        latestScoreDelta === 0
          ? "steady from last attempt"
          : `${latestScoreDelta > 0 ? "+" : ""}${latestScoreDelta} vs last session`,
      icon: TrendingUp,
      gradient: "from-violet-500 to-indigo-500",
      bgColor: "bg-violet-500/10 dark:bg-violet-500/15",
    },
    {
      label: "Best Score",
      value: `${bestScore}%`,
      note: bestScore >= 80 ? "high-confidence answer quality" : "room to raise the ceiling",
      icon: Award,
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, note, icon: Icon, gradient, bgColor }) => (
        <Card
          key={label}
          className="group overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold tracking-tight">
                  {value}
                </p>
                <p className="mt-2 max-w-[18rem] text-sm text-muted-foreground">
                  {note}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3 py-2",
                  bgColor,
                )}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
