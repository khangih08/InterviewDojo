"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
      <div>
        <h1 className="text-lg font-semibold text-violet-600">InterviewDojo</h1>
        <p className="text-sm text-slate-500">
          Practice technical interviews with AI feedback
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-700 sm:block">
          {mounted
            ? user?.full_name || user?.email || "Candidate"
            : "Candidate"}
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
