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
    activeBg: string;
    hoverBorder: string;
  }
> = {
  blue: {
    activeWrap: "bg-blue-500 text-white shadow-md shadow-blue-500/25",
    idleWrap: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/15",
    activeBg: "bg-blue-500/8 border-blue-500/30 dark:bg-blue-500/10",
    hoverBorder: "hover:border-blue-500/25",
  },
  purple: {
    activeWrap: "bg-purple-500 text-white shadow-md shadow-purple-500/25",
    idleWrap: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/15",
    activeBg: "bg-purple-500/8 border-purple-500/30 dark:bg-purple-500/10",
    hoverBorder: "hover:border-purple-500/25",
  },
  amber: {
    activeWrap: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
    idleWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/15",
    activeBg: "bg-amber-500/8 border-amber-500/30 dark:bg-amber-500/10",
    hoverBorder: "hover:border-amber-500/25",
  },
  emerald: {
    activeWrap: "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
    idleWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/15",
    activeBg: "bg-emerald-500/8 border-emerald-500/30 dark:bg-emerald-500/10",
    hoverBorder: "hover:border-emerald-500/25",
  },
  rose: {
    activeWrap: "bg-rose-500 text-white shadow-md shadow-rose-500/25",
    idleWrap: "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/15",
    activeBg: "bg-rose-500/8 border-rose-500/30 dark:bg-rose-500/10",
    hoverBorder: "hover:border-rose-500/25",
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/50 backdrop-blur-sm px-4 py-6 md:flex">
      <div className="px-2">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl glow-gradient text-xl font-black text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
            ID
          </span>
          <span className="text-xl font-bold tracking-tight">
            Interview<span className="glow-gradient-text">Dojo</span>
          </span>
        </Link>
      </div>

      <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          const palette = toneClasses[item.tone];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? `${palette.activeBg} font-medium`
                  : `border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50 ${palette.hoverBorder}`,
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
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
        className="relative mt-6 border-t border-border/60 pt-4"
        ref={accountMenuRef}
      >
        <button
          type="button"
          onClick={() => setAccountMenuOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-accent/30 px-3 py-3 text-left transition-all duration-200 hover:border-primary/25 hover:bg-accent/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl glow-gradient text-xs font-bold uppercase text-white shadow-md shadow-primary/20">
            {mounted ? initials : "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {mounted ? user?.full_name || "Candidate" : "Candidate"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {mounted ? user?.email || "Signed in" : "Signed in"}
            </p>
          </div>
          <ChevronUp
            className={[
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              accountMenuOpen ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
        </button>

        {accountMenuOpen && (
          <div
            role="menu"
            className="absolute bottom-[calc(100%+0.75rem)] left-0 z-20 w-full rounded-2xl border border-border/60 bg-card p-2 shadow-xl shadow-black/10 dark:shadow-black/30 animate-fade-in-up"
          >
            <Link
              href="/profile"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-accent/60 hover:text-foreground"
            >
              <UserRound className="h-4 w-4 text-primary" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setAccountMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-accent/60 hover:text-foreground"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>

            <div className="my-2 h-px bg-border/50" />

            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(false);
                logout();
                window.location.href = "/login";
              }}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-all duration-200 hover:bg-destructive/10"
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
