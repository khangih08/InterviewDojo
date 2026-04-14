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

type NavTone = "blue" | "purple" | "amber" | "emerald" | "rose";

const navItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: NavTone;
}> = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    tone: "blue",
  },
  { href: "/questions", label: "Questions", icon: CircleHelp, tone: "purple" },
  { href: "/interview", label: "Interview", icon: Video, tone: "amber" },
  { href: "/result", label: "Result", icon: BarChart3, tone: "emerald" },
  { href: "/admin", label: "Admin", icon: UserCog, tone: "blue" },
];

const toneClasses: Record<
  NavTone,
  {
    activeWrap: string;
    idleWrap: string;
    activeBorder: string;
    hoverBorder: string;
  }
> = {
  blue: {
    activeWrap: "bg-blue-500 text-white",
    idleWrap: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    activeBorder: "border-blue-300",
    hoverBorder: "hover:border-blue-300",
  },
  purple: {
    activeWrap: "bg-purple-500 text-white",
    idleWrap: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    activeBorder: "border-purple-300",
    hoverBorder: "hover:border-purple-300",
  },
  amber: {
    activeWrap: "bg-amber-500 text-white",
    idleWrap: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    activeBorder: "border-amber-300",
    hoverBorder: "hover:border-amber-300",
  },
  emerald: {
    activeWrap: "bg-emerald-500 text-white",
    idleWrap: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    activeBorder: "border-emerald-300",
    hoverBorder: "hover:border-emerald-300",
  },
  rose: {
    activeWrap: "bg-rose-500 text-white",
    idleWrap: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
    activeBorder: "border-rose-300",
    hoverBorder: "hover:border-rose-300",
  },
};

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
        {" "}
        <Link href="/dashboard" className="flex items-center gap-3">
          {" "}
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-900/50">
            {" "}
            ID{" "}
          </span>{" "}
          <span className="text-xl font-bold tracking-tight text-slate-950">
            {" "}
            InterviewDojo{" "}
          </span>{" "}
        </Link>{" "}
      </div>

      <nav className="space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          const palette = toneClasses[item.tone];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition",
                active
                  ? `${palette.activeBorder} bg-slate-100 text-slate-950`
                  : `border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-950 ${palette.hoverBorder}`,
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  active ? palette.activeWrap : palette.idleWrap,
                ].join(" ")}
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
