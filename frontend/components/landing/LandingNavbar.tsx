"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#compare", label: "Compare" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm shadow-primary/5"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl glow-gradient text-sm font-black text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
            ID
          </span>
          <span className="text-xl font-bold tracking-tight">
            Interview<span className="glow-gradient-text">Dojo</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          <Button variant="ghost" asChild className="font-semibold text-base">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="glow-gradient border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-semibold text-base">
            <Link href="/register">Sign up</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-accent/60 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 pb-4 animate-fade-in-up">
          <nav className="flex flex-col gap-1 py-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild className="w-full glow-gradient border-0 text-white">
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
