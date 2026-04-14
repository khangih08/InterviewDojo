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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-rose-500" />
          Next Action
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
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
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">{guide.planName}</p>
          <p className="mt-1 text-sm text-slate-600">{guide.planSummary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
