"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Sparkles, AlertTriangle } from "lucide-react";
import { type Plan } from "@/lib/landing";
import { Button } from "@/components/ui/button";

type UpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlan: Plan | null;
  onConfirm: () => void;
  loading: boolean;
};

export function UpgradeDialog({
  open,
  onOpenChange,
  targetPlan,
  onConfirm,
  loading,
}: UpgradeDialogProps) {
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

  if (!mounted || !open || !targetPlan) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Overlay click area */}
      <div 
        className="absolute inset-0" 
        onClick={() => !loading && onOpenChange(false)} 
        aria-hidden="true" 
      />
      
      {/* Modal content */}
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative w-full max-w-md animate-fade-in-up overflow-y-auto max-h-[90vh] rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        
        <div className="relative text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">
            Upgrade to <span className="glow-gradient-text">{targetPlan.name}</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re about to upgrade to the {targetPlan.name} plan at{" "}
            <strong className="text-foreground">{targetPlan.price}{targetPlan.period}</strong>.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border/50 bg-accent/30 p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">What you&apos;ll get:</h3>
          <ul className="space-y-2.5">
            {targetPlan.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="text-muted-foreground text-sm leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold">This is a simulated upgrade.</p>
            <p className="opacity-90">No actual payment will be processed.</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 border-0" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Upgrading..." : "Confirm Upgrade ✨"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
