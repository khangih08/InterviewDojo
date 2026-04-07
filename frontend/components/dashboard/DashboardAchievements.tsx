import { Trophy, Flame, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Achievement = {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  unlocked: boolean;
  color: string;
};

type DashboardAchievementsProps = {
  totalSessions: number;
  avgScore: number;
  completedSessions: number;
};

export function DashboardAchievements({
  totalSessions,
  avgScore,
  completedSessions,
}: DashboardAchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: "first-step",
      icon: Zap,
      label: "First Step",
      description: "Complete 1 interview",
      unlocked: totalSessions >= 1,
      color: completedSessions >= 1 ? "text-blue-500" : "text-gray-300",
    },
    {
      id: "momentum",
      icon: Flame,
      label: "Gaining Momentum",
      description: "Complete 5 interviews",
      unlocked: totalSessions >= 5,
      color: completedSessions >= 5 ? "text-orange-500" : "text-gray-300",
    },
    {
      id: "consistent",
      icon: Star,
      label: "Consistency",
      description: "Maintain 80%+ average",
      unlocked: avgScore >= 80,
      color: avgScore >= 80 ? "text-amber-500" : "text-gray-300",
    },
    {
      id: "excellence",
      icon: Trophy,
      label: "Excellence",
      description: "Achieve 95%+ score",
      unlocked: avgScore >= 95,
      color: avgScore >= 95 ? "text-purple-500" : "text-gray-300",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Achievements
          </span>
          <Badge variant="outline">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-100"
                    : "bg-gray-50 border border-gray-100 opacity-60"
                }`}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${achievement.color}`}
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">
                    {achievement.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <span className="text-xs font-bold text-amber-600">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {unlockedCount === achievements.length && (
          <div className="mt-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 text-center">
            <p className="text-sm font-semibold text-purple-900">
              🎉 All Achievements Unlocked!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
