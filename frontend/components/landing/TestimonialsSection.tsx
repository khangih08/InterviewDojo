import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { testimonials } from "@/lib/landing";

export default function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="outline">Testimonials</Badge>
        <h2 className="text-3xl font-bold tracking-tight">
          Loved by candidates worldwide
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <Card key={t.name} className="flex flex-col gap-4 p-6">
            <p className="flex-1 text-sm text-muted-foreground">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
