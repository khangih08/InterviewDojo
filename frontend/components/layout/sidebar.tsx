"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CircleHelp,
  Video,
  UserCog,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions", label: "Questions", icon: CircleHelp },
  { href: "/interview", label: "Interview", icon: Video },
  { href: "/result", label: "Result", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const visibleNavItems =
    mounted && user?.role !== "admin"
      ? navItems.filter((item) => item.href !== "/admin")
      : navItems;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          InterviewDojo
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Frontend MVP
        </h2>
      </div>

      <nav className="space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                active
                  ? "border-indigo-400 bg-slate-100 text-slate-950"
                  : "border-slate-300 text-slate-600 hover:border-indigo-300 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  active
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-200 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
