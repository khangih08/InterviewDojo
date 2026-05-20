"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toastSuccess, toastInfo } from "@/lib/toast";

export type PlanName = "Free" | "Pro" | "Teams";

export type SubscriptionState = {
  currentPlan: PlanName;
  subscribedAt: string | null;
};

type SubscriptionContextValue = {
  currentPlan: PlanName;
  subscribedAt: string | null;
  isFreePlan: boolean;
  upgrade: (planName: PlanName) => Promise<void>;
  downgrade: () => Promise<void>;
  loading: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionState>({
    currentPlan: "Free",
    subscribedAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("idc_subscription");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SubscriptionState;
        if (parsed.currentPlan) {
          setState(parsed);
        }
      } catch (e) {
        // Ignore parse error
      }
    }
    setHydrated(true);
  }, []);

  const upgrade = async (planName: PlanName) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    
    const newState: SubscriptionState = {
      currentPlan: planName,
      subscribedAt: new Date().toISOString(),
    };
    
    setState(newState);
    localStorage.setItem("idc_subscription", JSON.stringify(newState));
    setLoading(false);
    toastSuccess(`Upgraded to ${planName} successfully!`);
  };

  const downgrade = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    
    const newState: SubscriptionState = {
      currentPlan: "Free",
      subscribedAt: null,
    };
    
    setState(newState);
    localStorage.setItem("idc_subscription", JSON.stringify(newState));
    setLoading(false);
    toastInfo("Downgraded to Free plan");
  };

  // Always render the Provider to avoid context errors in children during SSR
  const value: SubscriptionContextValue = {
    currentPlan: state.currentPlan,
    subscribedAt: state.subscribedAt,
    isFreePlan: state.currentPlan === "Free",
    upgrade,
    downgrade,
    loading,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
