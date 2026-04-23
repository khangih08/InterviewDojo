"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/questions": "Question Bank",
  "/interview": "Interview",
  "/result": "Result",
  "/history": "History",
  "/sessions": "Sessions",
  "/admin": "Admin",
};

function resolvePageTitle(pathname: string) {
  const match = Object.keys(pageTitles).find((path) => pathname.startsWith(path));
  return match ? pageTitles[match] : "Workspace";
}

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const pageTitle = resolvePageTitle(pathname);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {pageTitle}
        </p>
        <h1 className="text-lg font-semibold text-slate-900">InterviewDojo Workspace</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm sm:block">
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
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
