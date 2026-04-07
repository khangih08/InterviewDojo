import { Flame, Zap } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartPoint } from "./useDashboardData";

type DashboardProgressCardProps = {
  loading: boolean;
  errorMessage: string | null;
  chartData: ChartPoint[];
};

export function DashboardProgressCard({
  loading,
  errorMessage,
  chartData,
}: DashboardProgressCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="h-[280px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : errorMessage ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-rose-500">
            {errorMessage}
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Zap className="mb-2 h-6 w-6 opacity-30" />
            No data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
