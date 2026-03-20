"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password, remember });
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error ? <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div> : null}

        <div>
          <label className="block text-sm font-medium text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/40 p-2.5 text-white outline-none transition-all placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="example@gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Mật khẩu</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/40 p-2.5 text-white outline-none transition-all placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-800" />
            Nhớ đăng nhập
          </label>
          <span className="text-xs text-slate-500">Mock: admin@gmail.com / 123456</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-slate-400">Mới gia nhập Dojo? </span>
        <Link href="/register" className="font-semibold text-white transition-colors hover:text-indigo-400">
          Tạo tài khoản
        </Link>
      </div>
    </>
  );
}
