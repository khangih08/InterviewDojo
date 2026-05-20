import { Check, Swords, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { comparisonRows, type CellValue } from "@/lib/landing";

function Cell({ value }: { value: CellValue }) {
  if (value === true)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4" />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
        <X className="h-4 w-4" />
      </span>
    );
  return <span className="text-sm font-medium text-muted-foreground">{value}</span>;
}

export default function ComparisonSection() {
  return (
    <section id="compare" className="relative py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">Why InterviewDojo</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            The difference <span className="glow-gradient-text">InterviewDojo</span> makes
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
            See how we stack up against generic tools — and why engineers choose the Dojo.
          </p>
        </div>

        <div className="overflow-x-auto max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/5">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="glow-gradient text-white">
                  <th className="text-left px-6 py-4 font-semibold w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold w-1/4">
                    <span className="inline-flex items-center gap-1.5"><Swords className="h-4 w-4" /> InterviewDojo</span>
                  </th>
                  <th className="text-center px-6 py-4 font-semibold w-1/4 text-white/70">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/30"}>
                    <td className="px-6 py-4 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center"><Cell value={row.dojo} /></td>
                    <td className="px-6 py-4 text-center"><Cell value={row.others} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
