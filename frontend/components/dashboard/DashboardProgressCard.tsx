import { Flame, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CategoryPoint,
  ChartPoint,
  StatusPoint,
} from "@/hooks/useDashboardData";

type DashboardProgressCardProps = {
  loading: boolean;
  errorMessage: string | null;
  chartData: ChartPoint[];
  categoryData: CategoryPoint[];
  statusData: StatusPoint[];
};

const PIE_COLORS = ["#7c3aed", "#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"];

export function DashboardProgressCard({
  loading,
  errorMessage,
  chartData,
  categoryData,
  statusData,
}: DashboardProgressCardProps) {
  return (
    <Card className="surface-panel overflow-hidden rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-red-500 text-white shadow-sm">
            <Flame className="h-3.5 w-3.5" />
          </div>
          Progress Snapshot
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        {loading ? (
          <div className="grid gap-4 lg:col-span-2 lg:grid-cols-[1.25fr_0.9fr]">
            <div className="space-y-4 rounded-2xl border border-border/40 bg-accent/10 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-border/40 bg-card p-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-28 w-full rounded-full" />
              </div>
              <div className="rounded-2xl border border-border/40 bg-card p-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
              </div>
            </div>
            <div className="lg:col-span-2 text-center text-sm text-muted-foreground">
              <span>Loading...</span>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="lg:col-span-2">
            <EmptyState
              title="Unable to load progress"
              description={errorMessage}
              action={{
                label: "Try again",
                onClick: () => window.location.reload(),
              }}
            />
          </div>
        ) : (
          <>
            <div className="h-70 rounded-xl border border-border/40 bg-accent/20 p-4">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Score Trend
                </p>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="oklch(0.55 0.24 275)"
                      strokeWidth={3}
                      dot={{ fill: "var(--foreground)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "oklch(0.55 0.24 275)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <Zap className="mb-2 h-6 w-6 opacity-30" />
                  No data yet
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="h-40 rounded-xl border border-border/40 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Practice Mix
                  </p>
                  <p className="text-xs text-muted-foreground/60">Top categories</p>
                </div>

                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="sessions"
                        nameKey="category"
                        innerRadius={32}
                        outerRadius={56}
                        paddingAngle={3}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No category data
                  </div>
                )}
              </div>

              <div className="h-40 rounded-xl border border-border/40 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Status Flow
                  </p>
                  <p className="text-xs text-muted-foreground/60">Session states</p>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="oklch(0.55 0.24 275)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
