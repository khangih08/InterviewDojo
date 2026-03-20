import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total sessions", value: "12" },
  { label: "Average score", value: "78" },
  { label: "Best category", value: "Frontend" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">Skeleton cho tuần 1 để bạn nối tiếp sang history và analytics tuần sau.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="border border-white/10 bg-slate-900/80 text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-white/10 bg-slate-900/80 text-white shadow-none">
        <CardHeader>
          <CardTitle>Progress overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm text-slate-400">Recent activity</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>• Completed React interview practice</li>
                <li>• Average communication score improved +6</li>
                <li>• System Design category needs more practice</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm text-slate-400">Upcoming tasks</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>• Add history page in tuần 5</li>
                <li>• Replace fake stats by real API</li>
                <li>• Add chart component when analysis API ổn định</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
