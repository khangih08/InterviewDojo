"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ full_name: fullName, email, password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Tạo tài khoản</h2>
        <p className="mt-2 text-sm text-slate-400">Chuẩn bị tài khoản để bắt đầu luyện tập phỏng vấn.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div> : null}

      <div>
        <label className="block text-sm font-medium text-slate-300">Họ và tên</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/40 p-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nguyễn Văn A" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/40 p-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="example@gmail.com" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">Mật khẩu</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/40 p-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-white hover:text-indigo-400">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
