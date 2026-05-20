"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { faqs } from "@/lib/landing";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium hover:text-primary transition-colors duration-200"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">FAQ</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Frequently asked <span className="glow-gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
            Everything you need to know before you enter the Dojo.
          </p>
        </div>
        <div className="max-w-2xl mx-auto rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-6 shadow-lg shadow-primary/3">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
