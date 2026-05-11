import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/landing";

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple, <span className="glow-gradient-text">transparent</span> pricing
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Start free. Upgrade when you&apos;re ready to go all-in.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto items-start">
          {plans.map((p) => (
            <div
              key={p.name}
              className={[
                "relative group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1",
                p.highlight
                  ? "border-primary/50 bg-card shadow-2xl shadow-primary/10 scale-[1.02]"
                  : "border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
              ].join(" ")}
            >
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full glow-gradient px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-primary/30">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </span>
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground">{p.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-muted-foreground">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className={[
                    "w-full transition-all duration-300",
                    p.highlight
                      ? "glow-gradient border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
                      : "",
                  ].join(" ")}
                  variant={p.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">{p.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
