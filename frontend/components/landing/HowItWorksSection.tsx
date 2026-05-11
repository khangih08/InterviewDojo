import { Badge } from "@/components/ui/badge";
import { steps } from "@/lib/landing";

export default function HowItWorksSection() {
  return (
    <section id="how" className="relative py-24 sm:py-32 bg-muted/30">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            How it works
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Four steps to{" "}
            <span className="glow-gradient-text">interview mastery</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-primary/30 to-primary/5" />
              )}

              <div className="text-center space-y-4">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300" />
                  <span className="relative text-3xl font-black glow-gradient-text">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
