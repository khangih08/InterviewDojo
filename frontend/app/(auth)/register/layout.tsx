import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "InterviewDojo – Auth",
  description: "Sign in or create your InterviewDojo account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (branding) ── */}
      <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-600/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[100px]" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black shadow-lg shadow-violet-900/50">
            ID
          </span>
          <span className="text-xl font-bold tracking-tight">
            InterviewDojo
          </span>
        </Link>

        {/* Testimonial / pitch */}
        <div className="relative z-10 space-y-8">
          {/* Feature list */}
          <ul className="space-y-4 text-sm text-zinc-300">
            {[
              { icon: "⚡", text: "AI-powered mock interviews in real time" },
              { icon: "🎯", text: "Personalised feedback for every answer" },
              {
                icon: "📈",
                text: "Track your progress with detailed analytics",
              },
              { icon: "🏆", text: "1000+ curated questions across all tracks" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Quote */}
          <blockquote className="border-l-2 border-violet-500 pl-5">
            <p className="text-base italic leading-relaxed text-zinc-200">
              "InterviewDojo helped me land my dream job at a top-tier tech
              company. The AI feedback was brutally honest – exactly what I
              needed."
            </p>
            <footer className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-700 text-sm font-bold">
                AN
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Anh Nguyen</p>
                <p className="text-xs text-zinc-400">
                  Software Engineer @ Google
                </p>
              </div>
            </footer>
          </blockquote>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} InterviewDojo. All rights reserved.
        </div>
      </aside>

      {/* ── Right panel (form area) ── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg font-black text-white">
            ID
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            InterviewDojo
          </span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
