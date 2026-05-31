"use client";

import { useMemo, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_MAP = {
  success: {
    title: 'Thanh toán thành công',
    description: 'Cảm ơn bạn đã thanh toán. Tài khoản của bạn đã được nâng cấp lên PRO.',
    icon: CheckCircle,
    cardClass: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100',
    iconClass: 'text-emerald-400',
  },
  failure: {
    title: 'Thanh toán không thành công',
    description: 'Giao dịch đã bị hủy hoặc không thành công. Vui lòng thử lại.',
    icon: XCircle,
    cardClass: 'bg-rose-950/90 border-rose-500/30 text-rose-100',
    iconClass: 'text-rose-400',
  },
};

export default function PaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const responseCode = searchParams.get('vnp_ResponseCode');
  const statusKey = responseCode === '00' ? 'success' : 'failure';

  const status = useMemo(() => STATUS_MAP[statusKey], [statusKey]);
  const Icon = status.icon;

  const handleBack = () => router.push('/dashboard');

  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  useEffect(() => {
    // On return from VNPay, call backend to validate the query and trigger server-side upgrade
    const doVerify = async () => {
      const code = searchParams.get('vnp_ResponseCode');
      if (!code) return;
      setVerifying(true);
      try {
        const params = Array.from(searchParams.entries())
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
          .join('&');

        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${base}/payment/vnpay/ipn?${params}`);
        const data = await res.json();
        if (res.ok && data.RspCode === '00') {
          setVerifyMsg('Xác thực thanh toán thành công. Tài khoản đã được nâng cấp.');
        } else {
          setVerifyMsg(`Xác thực thất bại: ${data.Message || 'Không rõ'}`);
        }
      } catch (err) {
        setVerifyMsg('Lỗi khi xác thực thanh toán.');
      } finally {
        setVerifying(false);
      }
    };
    doVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-[2rem] border border-slate-700/80 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur-xl">
        <div className="flex flex-col gap-6">
          <div className={`rounded-3xl border p-6 shadow-inner ${status.cardClass}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/20 shadow-lg">
                <Icon className={`h-10 w-10 ${status.iconClass}`} />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{status.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">{status.description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300 shadow-lg shadow-slate-950/40">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mã phản hồi VNPay</p>
              <p className="text-base font-medium text-white">{responseCode ?? 'Không có dữ liệu'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Gợi ý</p>
              <p className="text-sm leading-6 text-slate-300">
                {responseCode === '00'
                  ? 'Nếu bạn vẫn chưa thấy quyền lợi PRO, thử đăng xuất rồi đăng nhập lại hoặc vào trang hồ sơ để làm mới trạng thái.'
                  : 'Hãy kiểm tra lại thông tin và thử thanh toán lại, hoặc liên hệ bộ phận hỗ trợ nếu cần giúp đỡ.'}
              </p>
            </div>
          </div>

          {verifying && (
            <div className="rounded-md border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              Đang xác thực thanh toán...
            </div>
          )}

          {verifyMsg && (
            <div className="rounded-md border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              {verifyMsg}
            </div>
          )}

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-950 transition duration-200 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
