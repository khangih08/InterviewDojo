"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CircleHelp, Video, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions", label: "Questions", icon: CircleHelp },
  { href: "/interview", label: "Interview", icon: Video },
  { href: "/admin", label: "Admin", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const visibleNavItems =
    mounted && user?.role !== "admin"
      ? navItems.filter((item) => item.href !== "/admin")
      : navItems;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white px-4 py-6 md:block">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">InterviewDojo</p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-950">Frontend MVP</h2>
      </div>

      <nav className="space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
