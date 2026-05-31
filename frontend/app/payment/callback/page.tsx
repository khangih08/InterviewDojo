import { Suspense } from 'react';
import PaymentCallbackClient from './PaymentCallbackClient';

export const dynamic = 'force-dynamic';

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-white">Đang tải...</p></div>}>
      <PaymentCallbackClient />
    </Suspense>
  );
}
