import { BrainCircuit, ChartBar, Check, Code2, Swords, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { comparisonRows, type CellValue } from "@/lib/landing";

function Cell({ value }: { value: CellValue }) {
  if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
  if (value === false)
    return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-base font-medium">{value}</span>;
}

const highlights = [
  {
    icon: <Code2 className="h-6 w-6 text-primary" />,
    title: "Full-stack prep",
    desc: "The only platform covering coding, system design, and behavioural in one place.",
  },
  {
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    title: "Instant AI scoring",
    desc: "No waiting for human feedback — get a detailed score within seconds of answering.",
  },
  {
    icon: <ChartBar className="h-6 w-6 text-primary" />,
    title: "Measurable growth",
    desc: "Track every session so you can see exactly how much you've improved over time.",
  },
];

export default function ComparisonSection() {
  return (
    <section id="compare" className="bg-muted/40 py-20">
      <div className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline">Why InterviewDojo</Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            The difference InterviewDojo makes
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            See how we stack up against generic interview prep tools — and why
            engineers choose the Dojo.
          </p>
        </div>

        <div className="overflow-x-auto max-w-3xl mx-auto">
          <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left px-6 py-4 font-semibold w-1/2">
                  Feature
                </th>
                <th className="text-center px-6 py-4 font-semibold w-1/4">
                  <span className="inline-flex items-center gap-1.5">
                    <Swords className="h-4 w-4" /> InterviewDojo
                  </span>
                </th>
                <th className="text-center px-6 py-4 font-semibold w-1/4 text-primary-foreground/70">
                  Others
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                >
                  <td className="px-6 py-3.5 font-medium">{row.feature}</td>
                  <td className="px-6 py-3.5 text-center">
                    <Cell value={row.dojo} />
                  </td>
                  <td className="px-6 py-3.5 text-center text-muted-foreground">
                    <Cell value={row.others} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {highlights.map((c) => (
            <div
              key={c.title}
              className="bg-background rounded-xl border p-5 space-y-2 hover:shadow-md transition-shadow"
            >
              {c.icon}
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
