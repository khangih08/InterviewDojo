"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CircleHelp,
  Video,
  UserCog,
  BarChart3,
  Settings,
  UserRound,
  ChevronUp,
  LogOut,
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
  const { user, logout } = useAuth();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const initials = useMemo(() => {
    const source = (user?.full_name || user?.email || "Candidate").trim();
    const parts = source.split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.email, user?.full_name]);

  const visibleNavItems =
    mounted && user?.role !== "admin"
      ? navItems.filter((item) => item.href !== "/admin")
      : navItems;

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <div className="px-2">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-900/50">
            ID
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            InterviewDojo
          </span>
        </Link>
      </div>

      <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
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

      <div
        className="relative mt-6 border-t border-slate-200 pt-4"
        ref={accountMenuRef}
      >
        <button
          type="button"
          onClick={() => setAccountMenuOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-violet-200 hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold uppercase text-white">
            {mounted ? initials : "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950">
              {mounted ? user?.full_name || "Candidate" : "Candidate"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {mounted ? user?.email || "Signed in" : "Signed in"}
            </p>
          </div>
          <ChevronUp
            className={[
              "h-4 w-4 text-slate-500 transition-transform",
              accountMenuOpen ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
        </button>

        {accountMenuOpen && (
          <div
            role="menu"
            className="absolute bottom-[calc(100%+0.75rem)] left-0 z-20 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
          >
            <Link
              href="/profile"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <UserRound className="h-4 w-4 text-violet-600" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <Settings className="h-4 w-4 text-slate-600" />
              <span>Settings</span>
            </Link>

            <div className="my-2 h-px bg-slate-200" />

            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(false);
                logout();
                window.location.href = "/login";
              }}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-700 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
