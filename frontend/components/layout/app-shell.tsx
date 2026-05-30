import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const demoMode = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        <Sidebar />
        <main className="relative flex-1 px-4 py-6 pb-28 sm:px-6 md:ml-72 md:px-8 md:py-8 md:pb-8 lg:px-10">
          {demoMode ? (
            <div className="mx-auto mb-6 max-w-6xl rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 shadow-sm backdrop-blur-sm dark:text-amber-100">
              Demo mode is active. The app is using fixed sample data so the dashboard,
              history, and result screens stay stable.
            </div>
          ) : null}
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
