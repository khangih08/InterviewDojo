'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Zap, X, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Logic kiểm tra lượt dùng
  const isOutOfCredits = user?.plan === 'FREE' && (user?.credits || 0) <= 0;

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleStartWithCV = async () => {
    if (!file || !user?.id || isOutOfCredits) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/interviews/start-with-cv`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/interview/${data.interviewId || data.id}`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Không thể bắt đầu phỏng vấn.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = async () => {
    if (!user?.id || isOutOfCredits) return;
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/interviews/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          jobTitle: user.target_role || "Frontend Developer"
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/interview/${data.id}`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Không thể bắt đầu phỏng vấn.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 font-sans relative">
      <div className="max-w-md w-full bg-[#1e293b]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl text-center relative">

        <button
          onClick={handleCancel}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
          title="Quay lại"
        >
          <X size={24} />
        </button>

        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
          <FileText size={48} className="text-white" />
          {user?.plan === 'FREE' && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-[10px] font-black px-2 py-1 rounded-lg text-white shadow-lg">
              {user.credits} LƯỢT
            </div>
          )}
        </div>

        <h2 className="text-3xl font-black mb-2 text-white">Phòng chờ</h2>
        <p className="text-slate-400 text-sm mb-8 px-4">
          Mỗi lượt phỏng vấn bao gồm Theory, Coding và Báo cáo chi tiết.
        </p>

        {isOutOfCredits ? (
          <div className="mb-8 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center">
            <Crown className="mx-auto mb-3 text-rose-400" size={32} />
            <p className="text-rose-400 text-sm font-bold mb-4 text-pretty">Bạn đã hết lượt phỏng vấn miễn phí!</p>
            <Link
              href="/settings"
              className="inline-block w-full bg-rose-500 py-3 rounded-xl font-black text-xs text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
            >
              NÂNG CẤP GÓI PRO NGAY
            </Link>
          </div>
        ) : (
          <>
            <input
              type="file" accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="mb-4 block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white file:text-black hover:file:bg-slate-200 cursor-pointer"
            />

            <button
              onClick={handleStartWithCV} disabled={isLoading || !file}
              className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm text-white hover:bg-blue-500 transition-all disabled:opacity-50 mb-3 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'PHỎNG VẤN VỚI CV'}
            </button>

            <button
              onClick={handleQuickStart} disabled={isLoading}
              className="w-full bg-slate-800 py-4 rounded-2xl font-black text-sm text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : <><Zap size={16} /> BẮT ĐẦU NHANH</>}
            </button>
          </>
        )}

        <button
          onClick={handleCancel}
          className="mt-8 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
        >
          — Hủy bỏ và quay lại —
        </button>
      </div>
    </div>
  );
}