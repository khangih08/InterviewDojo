import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "InterviewDojo Auth",
  description: "Sign in or create your InterviewDojo account",
};

const highlights = [
  "AI mock interviews",
  "Instant feedback",
  "Progress tracking",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.10),_transparent_28%)]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-zinc-950 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-800 to-sky-700" />
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-14">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-900/30 ring-1 ring-white/10">
                ID
              </span>
              <span className="text-xl font-bold tracking-tight">
                InterviewDojo
              </span>
            </Link>

            <div className="max-w-xl space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white">
                  Luyện tập phỏng vấn với trải nghiệm gọn, rõ, và tự tin hơn.
                </h1>
                <p className="max-w-md text-base leading-7 text-violet-50/80">
                  Sign in or create your account để tiếp tục luyện tập với AI,
                  xem tiến độ, và quay lại lịch sử phỏng vấn bất cứ lúc nào.
                </p>
              </div>

              <Separator className="bg-white/10" />

              <div className="grid gap-3">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/90 backdrop-blur-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-sm text-violet-50/65">
              <p>Built for focused practice, not noisy distraction.</p>
              <p className="text-xs tracking-wide">
                &ldquo;Practice like the real interview.&rdquo;
              </p>
            </div>
          </div>
        </aside>

        <section className="relative flex items-center justify-center bg-gradient-to-b from-zinc-50 via-slate-50 to-zinc-100 px-6 py-10 sm:px-10 lg:px-12 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-3 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-900/20">
                ID
              </span>
              <span className="text-xl font-bold tracking-tight">
                InterviewDojo
              </span>
            </Link>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
