import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="min-h-screen md:pl-80">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
