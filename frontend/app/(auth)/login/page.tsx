"use client";

import { useState } from "react";
import Link from "next/link";
import { handleLogin } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await handleLogin(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <>
      <form action={onSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 block w-full bg-slate-800/40 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="example@gmail.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Mật khẩu
          </label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 block w-full bg-slate-800/40 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-slate-400"
            >
              Nhớ mật khẩu
            </label>
          </div>
          <Link
            href="#"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-slate-400">Mới gia nhập Dojo? </span>
        <Link
          href="/register"
          className="font-semibold text-white hover:text-indigo-400 transition-colors"
        >
          Tạo tài khoản
        </Link>
      </div>
    </>
  );
}
