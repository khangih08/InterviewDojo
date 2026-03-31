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
        <h2 className="text-2xl font-bold text-violet-600">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Skeleton cho tuan 1 de ban noi tiep sang history va analytics tuan sau.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card
            key={item.label}
            className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70"
          >
            <CardHeader>
              <CardTitle className="text-sm text-zinc-500">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-zinc-950">
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm shadow-zinc-200/70">
        <CardHeader>
          <CardTitle className="text-zinc-950">Progress overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
              <p className="text-sm text-zinc-500">Recent activity</p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                <li>- Completed React interview practice</li>
                <li>- Average communication score improved +6</li>
                <li>- System Design category needs more practice</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
              <p className="text-sm text-zinc-500">Upcoming tasks</p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                <li>- Add history page in week 5</li>
                <li>- Replace fake stats with real API</li>
                <li>- Add chart component when analysis API is stable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
