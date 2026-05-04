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

const PIE_COLORS = ["#0f766e", "#0284c7", "#4f46e5", "#d97706", "#dc2626"];

export function DashboardProgressCard({
  loading,
  errorMessage,
  chartData,
  categoryData,
  statusData,
}: DashboardProgressCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          Progress Snapshot
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        {loading ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-gray-400 lg:col-span-2">
            Loading...
          </div>
        ) : errorMessage ? (
          <div className="flex h-[280px] items-center justify-center text-center text-sm text-rose-500 lg:col-span-2">
            {errorMessage}
          </div>
        ) : (
          <>
            <div className="h-[280px] rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Score Trend
                </p>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: "#0f172a", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <Zap className="mb-2 h-6 w-6 opacity-30" />
                  No data yet
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="h-[160px] rounded-2xl border border-slate-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Practice Mix
                  </p>
                  <p className="text-xs text-slate-400">Top categories</p>
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
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No category data
                  </div>
                )}
              </div>

              <div className="h-[160px] rounded-2xl border border-slate-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Status Flow
                  </p>
                  <p className="text-xs text-slate-400">Session states</p>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
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
