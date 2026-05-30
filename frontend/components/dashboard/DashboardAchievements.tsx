import { Trophy, Flame, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Achievement = {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  unlocked: boolean;
  gradient: string;
  unlockedGradient: string;
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
      gradient: "from-blue-500 to-cyan-500",
      unlockedGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      id: "momentum",
      icon: Flame,
      label: "Gaining Momentum",
      description: "Complete 5 interviews",
      unlocked: totalSessions >= 5,
      gradient: "from-orange-500 to-red-500",
      unlockedGradient: "from-orange-500/10 to-red-500/10",
    },
    {
      id: "consistent",
      icon: Star,
      label: "Consistency",
      description: "Maintain 80%+ average",
      unlocked: avgScore >= 80,
      gradient: "from-amber-500 to-yellow-500",
      unlockedGradient: "from-amber-500/10 to-yellow-500/10",
    },
    {
      id: "excellence",
      icon: Trophy,
      label: "Excellence",
      description: "Achieve 95%+ score",
      unlocked: avgScore >= 95,
      gradient: "from-violet-500 to-purple-500",
      unlockedGradient: "from-violet-500/10 to-purple-500/10",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            Achievements
          </span>
          <Badge variant="outline" className="text-xs">
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
                className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-300 ${
                  achievement.unlocked
                    ? `bg-gradient-to-r ${achievement.unlockedGradient} border border-amber-500/20 dark:border-amber-500/15`
                    : "bg-accent/30 border border-border/30 opacity-50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${achievement.gradient} text-white shadow-sm`
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium">
                    {achievement.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {unlockedCount === achievements.length && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 p-3 text-center">
            <p className="text-sm font-semibold glow-gradient-text">
              🎉 All Achievements Unlocked!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
