import { TrendingUp, Zap, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStatsCardProps = {
  totalSessions: number;
  avgScore: number;
  bestScore: number;
};

export function DashboardStatsCard({
  totalSessions,
  avgScore,
  bestScore,
}: DashboardStatsCardProps) {
  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Average Score",
      value: `${avgScore}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Best Score",
      value: `${bestScore}%`,
      icon: Award,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
        <Card
          key={label}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`${bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
