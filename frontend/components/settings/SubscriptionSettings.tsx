"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { setUser } from "@/lib/auth";
import { Check, Crown, X, ArrowRight, CreditCard } from "lucide-react";

const paymentProviders = [
  {
    id: "vnpay",
    label: "VNPay",
    description: "Thanh toán nhanh qua VNPay QR hoặc link thanh toán.",
    checkoutUrl: "https://sandbox.vnpayment.vn/tryitnow/Home/Index",
  },
  {
    id: "momo",
    label: "MoMo",
    description: "Thanh toán qua ví MoMo trên điện thoại.",
    checkoutUrl: "https://momo.vn/",
  },
  {
    id: "zalopay",
    label: "ZaloPay",
    description: "Thanh toán qua ZaloPay nhanh chóng.",
    checkoutUrl: "https://zalopay.vn/",
  },
];

export function SubscriptionSettings() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"vnpay" | "momo" | "zalopay">("vnpay");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const proAmount = 199000;
  const selectedProviderData = paymentProviders.find((provider) => provider.id === selectedProvider)!;
  const paymentContent = `UPGRADE ${user?.id?.substring(0, 8).toUpperCase()}`;

  const openProviderCheckout = () => {
    window.open(selectedProviderData.checkoutUrl, "_blank");
  };

  // HÀM GỌI API ĐỂ TẠO ĐƠN THANH TOÁN THỰC
  const handleConfirmPayment = async () => {
    if (!user) return;
    if (selectedProvider !== 'vnpay') {
      setStatusMessage('Hiện tại chỉ hỗ trợ VNPay. Vui lòng chọn VNPay để thanh toán.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/payment/vnpay/create-url`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: proAmount }),
      });

      const data = await response.json();
      if (response.ok && data?.paymentUrl) {
        setStatusMessage('Đang chuyển bạn đến cổng VNPay...');
        window.location.href = data.paymentUrl;
        return;
      }

      const errorMessage = data?.message || data?.error || 'Không thể tạo link thanh toán VNPay. Vui lòng thử lại.';
      setStatusMessage(errorMessage);
    } catch (error) {
      console.error('Payment Confirmation Error:', error);
      setStatusMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      name: "FREE",
      price: "0đ",
      description: "Dành cho người mới bắt đầu trải nghiệm.",
      features: ["5 lượt phỏng vấn đầu tiên", "AI Mentor phản hồi cơ bản", "Hỗ trợ 1 file CV"],
      buttonText: "Đang sử dụng",
      isCurrent: user?.plan === "FREE",
      highlight: false,
      onClick: () => { },
    },
    {
      name: "PRO",
      price: "199.000đ",
      description: "Luyện tập không giới hạn, bứt phá sự nghiệp.",
      features: [
        "Không giới hạn lượt phỏng vấn",
        "AI phân tích CV chuyên sâu (RAG)",
        "Báo cáo lộ trình học tập cá nhân hóa",
        "Hỗ trợ Voice Interaction toàn diện",
      ],
      buttonText: user?.plan === "PRO" ? "Đang sử dụng" : "Nâng cấp lên PRO",
      isCurrent: user?.plan === "PRO",
      highlight: true,
      onClick: () => setShowModal(true),
    },
    {
      name: "ENTERPRISE",
      price: "Liên hệ",
      description: "Giải pháp cho trung tâm đào tạo & doanh nghiệp.",
      features: [
        "Quản lý tập trung nhiều tài khoản",
        "Dashboard theo dõi tiến độ học viên",
        "Tùy chỉnh Prompt theo yêu cầu",
        "Hỗ trợ kỹ thuật 24/7",
      ],
      buttonText: "Liên hệ tư vấn",
      isCurrent: false,
      highlight: false,
      onClick: () => window.open('https://zalo.me/sdt_cua_ban', '_blank'),
    },
  ];

  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight">Subscription Plan</h2>
        <p className="text-sm text-muted-foreground">Chọn gói phù hợp để tối ưu hóa việc luyện tập phỏng vấn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-[2rem] border p-6 transition-all duration-300
              ${plan.highlight
                ? 'border-emerald-500 bg-emerald-500/[0.03] shadow-lg shadow-emerald-500/10 scale-[1.02]'
                : 'border-border/60 bg-background/50 hover:border-border'}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-full flex items-center gap-1">
                <Crown size={10} /> PHỔ BIẾN NHẤT
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black">{plan.price}</span>
                {plan.price !== "Liên hệ" && <span className="text-muted-foreground text-xs">/vĩnh viễn</span>}
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
            </div>

            <ul className="mb-8 space-y-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[11px]">
                  <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="opacity-80">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={plan.isCurrent}
              onClick={plan.onClick}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all
                ${plan.isCurrent
                  ? 'bg-muted text-muted-foreground cursor-default'
                  : plan.highlight
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md'
                    : 'bg-foreground text-background hover:opacity-90'}`}
            >
              {plan.isCurrent && plan.name === "FREE" ? "Gói hiện tại" : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 text-center text-slate-900">
              <div className="bg-emerald-100 w-12 h-12 rounded-2xl text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CreditCard size={24} />
              </div>

              <h3 className="text-xl font-black mb-1 px-4">Nâng cấp tài khoản PRO</h3>
              <p className="text-slate-500 text-xs mb-6">Chọn cổng thanh toán và xác nhận để nâng cấp tự động, không cần admin duyệt.</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {paymentProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id as any)}
                    className={`rounded-3xl border px-3 py-3 text-xs font-semibold transition-all ${selectedProvider === provider.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-border/60 bg-white text-slate-700 hover:border-slate-400'}`}
                  >
                    {provider.label}
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left mb-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Cổng thanh toán</p>
                    <h4 className="font-bold text-base">{selectedProviderData.label}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={openProviderCheckout}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase text-white transition hover:bg-slate-800"
                  >
                    Mở cổng <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">{selectedProviderData.description}</p>
              </div>

              <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Số tiền</span>
                  <span className="font-black">199.000đ</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nội dung</span>
                  <span className="font-mono font-bold text-emerald-600">{paymentContent}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPayment}
                className="mt-2 w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? "ĐANG XÁC NHẬN..." : "Xác nhận thanh toán"}
              </button>

              {statusMessage && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {statusMessage}
                </div>
              )}

              <p className="mt-4 text-[10px] text-slate-400 leading-relaxed italic">
                * Khi đã hoàn thành thanh toán trên cổng, hệ thống sẽ tự động bật PRO ngay lập tức.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-accent/30 p-4 border border-border/40">
        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          Số lượt phỏng vấn của bạn sẽ được cập nhật trong vòng 5 phút sau khi chuyển khoản thành công.
        </p>
      </div>
    </section>
  );
}