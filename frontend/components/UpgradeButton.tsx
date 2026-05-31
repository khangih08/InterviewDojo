"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface UpgradeButtonProps {
  userId: string;
}

export default function UpgradeButton({ userId }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!userId) {
      window.alert('Thiếu thông tin người dùng để khởi tạo thanh toán.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/payment/vnpay/create-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount: 199000 }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data?.message || data?.error || 'Không thể tạo link VNPay. Vui lòng thử lại.';
        window.alert(message);
        return;
      }

      const paymentUrl = data?.url ?? data?.paymentUrl;
      if (!paymentUrl || typeof paymentUrl !== 'string') {
        window.alert('Phản hồi từ server không chứa URL thanh toán hợp lệ.');
        return;
      }

      window.location.href = paymentUrl;
    } catch (error) {
      console.error('UpgradeButton error:', error);
      window.alert('Lỗi kết nối tới server. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition duration-200 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-700`}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang chuyển tới VNPay...
        </>
      ) : (
        'Nâng cấp PRO với VNPay'
      )}
    </button>
  );
}
