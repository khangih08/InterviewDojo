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
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm">
            <Flame className="h-3.5 w-3.5" />
          </div>
          Progress Snapshot
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        {loading ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground lg:col-span-2">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <span>Loading...</span>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex h-[280px] items-center justify-center text-center text-sm text-destructive lg:col-span-2">
            {errorMessage}
          </div>
        ) : (
          <>
            <div className="h-[280px] rounded-2xl border border-border/40 bg-accent/20 p-4">
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
              <div className="h-[160px] rounded-2xl border border-border/40 bg-card p-4">
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

              <div className="h-[160px] rounded-2xl border border-border/40 bg-card p-4">
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
