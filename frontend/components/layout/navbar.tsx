"use client";

import { useSyncExternalStore } from "react";
<<<<<<< HEAD
import { usePathname } from "next/navigation";
=======
<<<<<<< HEAD
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
>>>>>>> 6cbfa88 (fix frontend test)
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
<<<<<<< HEAD
=======
  const router = useRouter();
=======
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
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const pageTitle = resolvePageTitle(pathname);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
=======
<<<<<<< HEAD
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
>>>>>>> 6cbfa88 (fix frontend test)
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {pageTitle}
        </p>
        <h1 className="text-lg font-semibold text-slate-900">InterviewDojo Workspace</h1>
      </div>

      <div className="flex items-center gap-3">
<<<<<<< HEAD
=======
        <div className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-700 sm:block">
          {displayName}
=======
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {pageTitle}
        </p>
        <h1 className="text-lg font-semibold text-slate-900">InterviewDojo Workspace</h1>
      </div>

      <div className="flex items-center gap-3">
>>>>>>> 6cbfa88 (fix frontend test)
        <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm sm:block">
          {mounted
            ? user?.full_name || user?.email || "Candidate"
            : "Candidate"}
<<<<<<< HEAD
=======
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
        </div>
        <button
          onClick={() => {
            logout();
            // Force reload to clear all state
            window.location.href = "/login";
          }}
<<<<<<< HEAD
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
=======
<<<<<<< HEAD
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
=======
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
        >
          Logout
        </button>
      </div>
    </header>
  );
}
