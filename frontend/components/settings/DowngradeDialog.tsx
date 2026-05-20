"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowDown } from "lucide-react";
import { type Plan } from "@/lib/landing";
import { Button } from "@/components/ui/button";

type DowngradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: Plan | null;
  freePlan: Plan | null;
  onConfirm: () => void;
  loading: boolean;
};

export function DowngradeDialog({
  open,
  onOpenChange,
  currentPlan,
  freePlan,
  onConfirm,
  loading,
}: DowngradeDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, loading, onOpenChange]);

  if (!mounted || !open || !currentPlan || !freePlan) return null;

  // Simple difference logic: find features in currentPlan that are not in freePlan
  const lostFeatures = currentPlan.features.filter(
    (feat) => !freePlan.features.includes(feat)
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="absolute inset-0" 
        onClick={() => !loading && onOpenChange(false)} 
        aria-hidden="true" 
      />
      
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative w-full max-w-md animate-fade-in-up overflow-y-auto max-h-[90vh] rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-destructive/10 blur-3xl" />
        
        <div className="relative text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <ArrowDown className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">
            Downgrade to Free?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You will lose access to {currentPlan.name} features.
          </p>
        </div>

        {lostFeatures.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border/50 bg-accent/30 p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">You&apos;ll lose access to:</h3>
            <ul className="space-y-2.5">
              {lostFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-muted-foreground text-sm leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold">This is a simulated downgrade.</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Keep {currentPlan.name}
          </Button>
          <Button 
            variant="destructive"
            className="flex-1" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Downgrading..." : "Downgrade ↓"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
