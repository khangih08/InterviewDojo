import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const demoMode = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="relative flex-1 px-4 py-5 pb-28 sm:px-6 md:ml-72 md:px-8 md:py-7 md:pb-8 lg:px-10">
          {demoMode ? (
            <div className="mx-auto mb-6 max-w-6xl rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 shadow-sm dark:text-amber-100">
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
