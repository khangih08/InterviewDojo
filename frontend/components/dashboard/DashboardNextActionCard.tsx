import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoleGuide } from "./DashboardHero";

type DashboardNextActionCardProps = {
  guide: RoleGuide;
};

export function DashboardNextActionCard({
  guide,
}: DashboardNextActionCardProps) {
  return (
    <Card className="surface-panel rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
            <Target className="h-3.5 w-3.5" />
          </div>
          Next Action
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
          {guide.nextAction}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Focus Topics
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.focusTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-lg border border-border/50 bg-accent/60 px-3 py-1 text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-accent/20 p-4">
          <p className="text-sm font-medium">{guide.planName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{guide.planSummary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
