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
      <section className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm px-6 py-6 shadow-sm">
        <div className="flex items-start gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-2xl bg-accent" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 rounded bg-accent" />
            <div className="h-5 w-40 rounded bg-accent" />
            <div className="h-4 w-60 rounded bg-accent" />
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
      gradient: "from-amber-500 to-orange-500",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Easy on the eyes in low light",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follows your device preferences",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm px-6 py-6 shadow-sm transition-all duration-300">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
          <Sun className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">
            Appearance
          </p>
          <h2 className="mt-2 text-xl font-bold">
            Theme Preference
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
                    "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-300 hover:-translate-y-0.5 group",
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/40 bg-card hover:border-primary/25 hover:shadow-md"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? `bg-gradient-to-br ${t.gradient} text-white shadow-md`
                        : "bg-accent text-muted-foreground group-hover:bg-accent/80"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-foreground" : "text-foreground/80"
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-tight">
                      {t.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
                      <svg
                        className="h-3.5 w-3.5"
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
