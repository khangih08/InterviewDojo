import Link from "next/link";
import { MoveRight, Zap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-20 right-0 h-[300px] w-[300px] rounded-full bg-chart-3/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[250px] w-[400px] rounded-full bg-chart-2/6 blur-3xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-28 sm:py-36 text-center">
        <div className="animate-fade-in-up">
          <Badge
            variant="secondary"
            className="gap-1.5 px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Mock Interviews
          </Badge>
        </div>

        <h1 className="animate-fade-in-up-delay-1 mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Train hard.{" "}
          <span className="glow-gradient-text">Interview smarter.</span>{" "}
          Land the job.
        </h1>

        <p className="animate-fade-in-up-delay-2 mt-6 text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          InterviewDojo puts you through real interview conditions and delivers
          instant AI feedback — so you show up confident on the day that matters.
        </p>

        <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="glow-gradient border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 text-base px-8 animate-pulse-glow">
            <Link href="/register">
              Start practicing free <MoveRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="hover:bg-accent/60 transition-all duration-300 text-base px-8">
            <Link href="#how">See how it works</Link>
          </Button>
        </div>

        {/* Social proof */}
        <div className="animate-fade-in-up-delay-3 mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["LN", "MT", "AP", "TH"].map((initials, i) => (
                <div
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white"
                  style={{
                    background: [
                      "oklch(0.55 0.24 275)",
                      "oklch(0.5 0.26 265)",
                      "oklch(0.6 0.2 295)",
                      "oklch(0.55 0.18 165)",
                    ][i],
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span>Trusted by <strong className="text-foreground">2,000+</strong> candidates</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Zap key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1">4.9/5 average rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
