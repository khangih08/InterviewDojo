import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ── LEFT PANEL ── */}
        <div className="relative hidden overflow-hidden bg-sky-100 lg:flex lg:flex-col">
          {/* Background image */}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-violet-700/60 to-indigo-900/80" />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-10">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-sm font-black text-white shadow-lg backdrop-blur-sm ring-1 ring-white/30">
                ID
              </span>
              <span className="text-lg font-semibold tracking-tight">
                InterviewDojo
              </span>
            </Link>

            {/* Hero text */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold leading-tight text-white">
                  Luyện tập phỏng vấn
                  <br />
                  <span className="text-violet-200">thông minh hơn.</span>
                </h1>
                <p className="max-w-sm text-base leading-relaxed text-violet-200/80">
                  Chuẩn bị cho mọi buổi phỏng vấn với AI, câu hỏi thực tế và
                  phản hồi tức thì để bạn tự tin hơn mỗi ngày.
                </p>
              </div>

              <Separator className="bg-white/20" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "10K+", label: "Câu hỏi" },
                  { value: "95%", label: "Hài lòng" },
                  { value: "3K+", label: "Người dùng" },
                ].map(({ value, label }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-violet-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer quote */}
            <p className="text-xs text-violet-300/60">
              &ldquo;Cơ hội chỉ đến với người chuẩn bị sẵn sàng.&rdquo;
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
          {/* Mobile logo — chỉ hiện khi < lg */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-3 text-zinc-950 dark:text-white lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-900/20">
              ID
            </span>
            <span className="text-lg font-semibold tracking-tight">
              InterviewDojo
            </span>
          </Link>

          <section className="w-full max-w-md">{children}</section>
        </div>
      </div>
    </main>
  );
}
