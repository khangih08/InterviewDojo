"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur md:px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">InterviewDojo</h1>
        <p className="text-sm text-slate-400">Practice technical interviews with AI feedback</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 sm:block">
          {user?.full_name || user?.email || "Candidate"}
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
