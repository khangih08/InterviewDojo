"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CircleHelp, LayoutDashboard, Settings, Video } from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/questions", label: "Questions", icon: CircleHelp },
  { href: "/interview", label: "Interview", icon: Video },
  { href: "/result", label: "Result", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const visibleItems = mobileNavItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-3 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}