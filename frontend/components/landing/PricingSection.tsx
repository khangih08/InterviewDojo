import Link from "next/link";
import { UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { plans } from "@/lib/landing";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline">Pricing</Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start free. Upgrade when you're ready to go all-in.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`flex flex-col ${p.highlight ? "border-primary shadow-lg" : ""}`}
            >
              {p.highlight && (
                <div className="bg-primary text-primary-foreground text-xs font-semibold text-center py-1 rounded-t-xl">
                  Most popular
                </div>
              )}
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {p.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-6">
                <ul className="space-y-2 flex-1">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={p.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
