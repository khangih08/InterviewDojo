import { AppShell } from "@/components/layout/app-shell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#080c18] overflow-hidden">
      {/* ── Ambient Blobs (Đưa từ Interview Page ra đây) ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky-600/10 blur-[100px]" />
      </div>

      {/* ── Nội dung chính ── */}
      <div className="relative z-10">
        <AppShell>{children}</AppShell>
      </div>
    </div>
  );
}
