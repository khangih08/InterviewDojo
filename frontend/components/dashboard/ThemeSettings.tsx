"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-5 w-40 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-60 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Ideal for bright environments",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Easy on the eyes in low light",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follows your device preferences",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          <Sun className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">
            Appearance
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            Theme Preference
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Choose how InterviewDojo looks to you.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;

              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group",
                    isActive
                      ? "border-amber-600 bg-amber-50/50 dark:border-amber-500 dark:bg-amber-500/10"
                      : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-amber-600 text-white dark:bg-amber-500"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive
                          ? "text-amber-900 dark:text-amber-100"
                          : "text-slate-900 dark:text-slate-100"
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      {t.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white dark:bg-amber-500">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
