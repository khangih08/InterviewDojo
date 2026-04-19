"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { faqs } from "@/lib/landing";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-primary transition-colors"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FaqSection() {
  return (
    <section id="faq" className="bg-muted/40 py-20">
      <div className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to know before you enter the Dojo.
          </p>
        </div>
        <div className="max-w-2xl mx-auto bg-background rounded-xl border px-6 divide-y">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
