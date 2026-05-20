"use client";

import { useState } from "react";
import { CreditCard, Check, Sparkles } from "lucide-react";
import { plans, type Plan } from "@/lib/landing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSubscription, type PlanName } from "@/contexts/subscription-context";
import { UpgradeDialog } from "./UpgradeDialog";
import { DowngradeDialog } from "./DowngradeDialog";

const planOrder: Record<string, number> = { Free: 0, Pro: 1, Teams: 2 };

export function SubscriptionSettings() {
  const { currentPlan, loading, upgrade, downgrade } = useSubscription();
  const [upgradeTarget, setUpgradeTarget] = useState<Plan | null>(null);
  const [showDowngrade, setShowDowngrade] = useState(false);

  const currentPlanData = plans.find((p) => p.name === currentPlan) || plans[0];
  const freePlanData = plans.find((p) => p.name === "Free") || plans[0];
  const currentOrder = planOrder[currentPlan] ?? 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm px-6 py-6 shadow-sm transition-all duration-300">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl" />

      {/* Header Row */}
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-400">
            Subscription
          </p>
          <h2 className="mt-2 text-xl font-bold">Your Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription and billing
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="relative mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {plans.map((p: Plan) => {
          const isCurrent = p.name === currentPlan;
          const pOrder = planOrder[p.name] ?? 0;

          return (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-5 transition-all duration-300",
                p.highlight
                  ? "border-primary/50 bg-card shadow-lg shadow-primary/10"
                  : "border-border/60 bg-card/50",
                isCurrent && !p.highlight ? "border-emerald-500/30 shadow-md shadow-emerald-500/5" : ""
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full glow-gradient px-3 py-1 text-[10px] font-semibold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" /> Recommended
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                </div>
                {isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="mt-4 flex-1">
                <ul className="space-y-2.5">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span className="text-muted-foreground text-sm leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Active Plan
                  </Button>
                ) : pOrder < currentOrder ? (
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={() => setShowDowngrade(true)}
                    disabled={loading}
                  >
                    Downgrade to {p.name}
                  </Button>
                ) : (
                  <Button
                    variant={p.highlight ? "default" : "outline"}
                    className={cn(
                      "w-full transition-all duration-300",
                      p.highlight
                        ? "bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 text-white border-0"
                        : ""
                    )}
                    onClick={() => setUpgradeTarget(p)}
                    disabled={loading}
                  >
                    Upgrade to {p.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <UpgradeDialog
        open={!!upgradeTarget}
        onOpenChange={(open) => !open && setUpgradeTarget(null)}
        targetPlan={upgradeTarget}
        onConfirm={async () => {
          if (upgradeTarget) {
            await upgrade(upgradeTarget.name as PlanName);
            setUpgradeTarget(null);
          }
        }}
        loading={loading}
      />

      <DowngradeDialog
        open={showDowngrade}
        onOpenChange={setShowDowngrade}
        currentPlan={currentPlanData}
        freePlan={freePlanData}
        onConfirm={async () => {
          await downgrade();
          setShowDowngrade(false);
        }}
        loading={loading}
      />
    </section>
  );
}
