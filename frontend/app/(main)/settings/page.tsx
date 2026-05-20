import { Shield } from "lucide-react";

import { SessionsManagement } from "@/components/settings/SessionsManagement";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";

export const metadata = {
  title: "Settings",
  description: "Manage your account and signed-in devices",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm px-6 py-6 shadow-sm">
        {/* Subtle decorative background */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your account preferences and control where you are signed
              in from one place.
            </p>
          </div>
        </div>
      </section>

      <ThemeSettings />

      <SubscriptionSettings />

      <SessionsManagement />
    </div>
  );
}
