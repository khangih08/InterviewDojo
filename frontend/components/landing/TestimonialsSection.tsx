import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/lib/landing";
import { Quote } from "lucide-react";

const avatarColors = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-500",
  "from-fuchsia-500 to-pink-500",
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by candidates{" "}
            <span className="glow-gradient-text">worldwide</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <Quote className="h-8 w-8 text-primary/15 mb-4" />
              <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-white text-xs font-bold shadow-md`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
