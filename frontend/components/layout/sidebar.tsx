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
  Smartphone,
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
  { href: "/sessions", label: "Sessions", icon: Smartphone, tone: "rose" },
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
<<<<<<< HEAD
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/85 px-5 py-6 backdrop-blur md:block">
      <div className="mb-8 px-2">
=======
<<<<<<< HEAD
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 md:block">
      <div className="mb-8 px-1">
>>>>>>> 6cbfa88 (fix frontend test)
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black tracking-wide text-white shadow-lg shadow-slate-900/30">
            ID
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            InterviewDojo
          </span>
        </Link>
<<<<<<< HEAD
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Luyện phỏng vấn có cấu trúc, theo dõi tiến bộ mỗi ngày.
        </p>
=======
=======
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/85 px-5 py-6 backdrop-blur md:block">
      <div className="mb-8 px-2">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black tracking-wide text-white shadow-lg shadow-slate-900/30">
            ID
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            InterviewDojo
          </span>
        </Link>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Luyện phỏng vấn có cấu trúc, theo dõi tiến bộ mỗi ngày.
        </p>
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
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
<<<<<<< HEAD
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                active
                  ? `${palette.activeBorder} bg-slate-100 text-slate-950 shadow-sm`
                  : `border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 ${palette.hoverBorder}`,
=======
<<<<<<< HEAD
                "group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition",
                active
                  ? `${palette.activeBorder} bg-slate-100 text-slate-950 shadow-sm`
                  : `border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950 ${palette.hoverBorder}`,
=======
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                active
                  ? `${palette.activeBorder} bg-slate-100 text-slate-950 shadow-sm`
                  : `border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 ${palette.hoverBorder}`,
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
              ].join(" ")}
            >
              <span
                className={[
<<<<<<< HEAD
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
=======
<<<<<<< HEAD
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
=======
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
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
