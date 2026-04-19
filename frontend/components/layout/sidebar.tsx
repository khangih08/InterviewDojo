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
  Code2,
  Video,
  UserCog,
  BarChart3,
  Smartphone,
  History,
  Settings,
  LogOut,
  UserRound,
  HelpCircle,
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
  { href: "/history", label: "History", icon: History, tone: "emerald" },
  { href: "/questions", label: "Questions", icon: CircleHelp, tone: "purple" },
  { href: "/code-editor", label: "Code Editor", icon: Code2, tone: "purple" },
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
    <aside className="flex min-h-screen shrink-0 flex-col border-b border-slate-200 bg-white/95 px-4 py-5 shadow-sm backdrop-blur md:fixed md:inset-y-0 md:left-0 md:z-30 md:w-80 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="flex items-center justify-between gap-3 md:mb-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-900/30">
            ID
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-slate-950">
              InterviewDojo
            </p>
            <p className="text-xs text-slate-500">
              Interview practice workspace
            </p>
          </div>
        </Link>
      </div>

      <nav className="grid gap-2 md:block md:flex-1 md:space-y-2 md:overflow-y-auto md:pr-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          const palette = toneClasses[item.tone];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                active
                  ? `${palette.activeBorder} bg-slate-100 text-slate-950`
                  : `border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 ${palette.hoverBorder}`,
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  active ? palette.activeWrap : palette.idleWrap,
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className="relative mt-auto border-t border-slate-200 pt-5"
        ref={accountMenuRef}
      >
        <button
          type="button"
          onClick={() => setAccountMenuOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3 text-left shadow-sm transition hover:border-violet-200 hover:bg-white"
          aria-haspopup="menu"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold uppercase text-white shadow-lg shadow-violet-900/20">
            {mounted ? initials : "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950">
              {mounted
                ? user?.full_name || user?.email || "Candidate"
                : "Candidate"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {mounted
                ? user?.target_role || user?.email || "No role set"
                : "Loading account..."}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
            <Settings className="h-4 w-4" />
          </div>
        </button>

        {accountMenuOpen && (
          <div
            role="menu"
            className="absolute bottom-[calc(100%+0.75rem)] left-0 z-20 w-full rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10"
          >
            <div className="px-3 py-3">
              <p className="truncate text-sm font-semibold text-slate-950">
                {mounted
                  ? user?.full_name || user?.email || "Candidate"
                  : "Candidate"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {mounted
                  ? user?.email || "No email connected"
                  : "Loading account..."}
              </p>
            </div>
            <div className="my-2 h-px bg-slate-200" />

            <Link
              href="/settings"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <UserRound className="h-4 w-4 text-violet-600" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <Settings className="h-4 w-4 text-slate-600" />
              <span>Settings</span>
            </Link>

            <Link
              href="/sessions"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              <span>Active sessions</span>
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
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-rose-700 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
