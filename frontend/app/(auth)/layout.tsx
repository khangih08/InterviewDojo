import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "InterviewDojo Auth",
  description: "Sign in or create your InterviewDojo account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-3 text-zinc-950 dark:text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-base font-black text-white shadow-lg shadow-violet-900/20">
            ID
          </span>
          <span className="text-lg font-semibold tracking-tight">
            InterviewDojo
          </span>
        </Link>

        <section className="w-full max-w-xl">

          {children}
        </section>
      </div>
    </main>
  );
}
