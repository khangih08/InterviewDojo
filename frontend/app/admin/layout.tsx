"use client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/'); // Đá ra trang chủ nếu không phải admin
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Đang kiểm tra quyền Admin...</div>;
  }

  return <div className="bg-[#0f172a] min-h-screen">{children}</div>;
}