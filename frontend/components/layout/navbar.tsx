"use client";

import { useIsMounted } from "@/hooks/useIsMounted";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();
  const mounted = useIsMounted();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 py-4 md:px-6">
      <div>
        <h1 className="text-lg font-semibold">
          Interview<span className="glow-gradient-text">Dojo</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Practice technical interviews with AI feedback
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-border/60 bg-accent/50 px-3 py-1.5 text-sm sm:block">
          {mounted
            ? user?.full_name || user?.email || "Candidate"
            : "Candidate"}
        </div>
        <button
          onClick={() => {
            logout();
            // Force reload to clear all state
            window.location.href = "/login";
          }}
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
