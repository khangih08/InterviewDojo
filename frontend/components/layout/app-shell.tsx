import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f8fafc_42%,#f1f5f9)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-400">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
=======
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
              {children}
            </div>
=======
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f8fafc_42%,#f1f5f9)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-400">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
>>>>>>> 0c20a06 (feat: polish question card hover effect)
>>>>>>> 6cbfa88 (fix frontend test)
          </main>
        </div>
      </div>
    </div>
  );
}
