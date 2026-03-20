"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CircleHelp, Video, UserCog } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions", label: "Questions", icon: CircleHelp },
  { href: "/interview", label: "Interview", icon: Video },
  { href: "/admin", label: "Admin", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950/70 px-4 py-6 md:block">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">InterviewDojo</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Frontend MVP</h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active ? "bg-indigo-500/20 text-white ring-1 ring-indigo-400/40" : "text-slate-300 hover:bg-white/5 hover:text-white"
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
