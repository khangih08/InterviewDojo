import {
  BrainCircuit,
  ChartBar,
  Clock,
  Code2,
  Layers,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { features } from "@/lib/landing";

const iconMap: Record<string, { icon: React.ReactNode; gradient: string }> = {
  "AI-Powered Feedback": {
    icon: <BrainCircuit className="h-6 w-6" />,
    gradient: "from-violet-500 to-indigo-600",
  },
  "Coding Challenges": {
    icon: <Code2 className="h-6 w-6" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  "Behavioral Questions": {
    icon: <MessageSquare className="h-6 w-6" />,
    gradient: "from-fuchsia-500 to-pink-500",
  },
  "Progress Tracking": {
    icon: <ChartBar className="h-6 w-6" />,
    gradient: "from-emerald-500 to-teal-500",
  },
  "Timed Mock Sessions": {
    icon: <Clock className="h-6 w-6" />,
    gradient: "from-amber-500 to-orange-500",
  },
  "Multi-track Paths": {
    icon: <Layers className="h-6 w-6" />,
    gradient: "from-rose-500 to-red-500",
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="glow-gradient-text">ace it</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
            From coding rounds to culture-fit questions, we&apos;ve got every stage of
            the interview covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const meta = iconMap[f.title];
            return (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${meta?.gradient ?? "from-primary to-primary"} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  {meta?.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
