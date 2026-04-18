import { Badge } from "@/components/ui/badge";
import { steps } from "@/lib/landing";

export default function HowItWorksSection() {
  return (
    <section id="how" className="bg-muted/40 py-20">
      <div className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline">How it works</Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Four steps to interview mastery
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="space-y-3">
              <span className="text-5xl font-black text-primary/20 leading-none">
                {s.step}
              </span>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
