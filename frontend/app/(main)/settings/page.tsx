import { Shield } from "lucide-react";

import { SessionsManagement } from "@/components/dashboard/SessionsManagement";
import { ThemeSettings } from "@/components/dashboard/ThemeSettings";

export const metadata = {
  title: "Settings",
  description: "Manage your account and signed-in devices",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Manage your account preferences and control where you are signed
              in from one place.
            </p>
          </div>
        </div>
      </section>

      <ThemeSettings />

      <SessionsManagement />
    </div>
  );
}
