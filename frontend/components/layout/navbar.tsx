"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Zap, Crown } from "lucide-react"; // Import thêm icon cho đẹp

export function Navbar() {
  const { user, logout } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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
        {/* HIỂN THỊ CREDITS VÀ PLAN */}
        {mounted && user && (
          <div className="flex items-center gap-2 mr-2">
            {/* Badge Lượt phỏng vấn */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-500">
              <Zap size={12} fill="currentColor" />
              {user.credits} LƯỢT
            </div>

            {/* Badge Gói cước */}
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black tracking-tighter
              ${user.plan === 'PRO'
                ? 'border-amber-500/30 bg-amber-500/20 text-amber-500'
                : 'border-border/60 bg-accent/50 text-muted-foreground'}`}>
              {user.plan === 'PRO' && <Crown size={12} fill="currentColor" />}
              {user.plan}
            </div>
          </div>
        )}

        <div className="hidden rounded-full border border-border/60 bg-accent/50 px-3 py-1.5 text-sm sm:block">
          {mounted
            ? user?.full_name || user?.email || "Candidate"
            : "Candidate"}
        </div>

        <button
          onClick={() => {
            logout();
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