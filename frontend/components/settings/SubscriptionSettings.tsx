"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Check, Crown, X, QrCode } from "lucide-react";

export function SubscriptionSettings() {
  const { user } = useAuth(); // Lưu ý: Đảm bảo useAuth trả về cả is_pending_pro
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myBank = {
    id: "MB",
    number: "0362586418",
    name: "NGUYEN QUANG HUY",
  };

  const proAmount = 199000;
  const paymentContent = `UPGRADE ${user?.id?.substring(0, 8).toUpperCase()}`;
  const qrUrl = `https://img.vietqr.io/image/${myBank.id}-${myBank.number}-compact.jpg?amount=${proAmount}&addInfo=${paymentContent}&accountName=${encodeURIComponent(myBank.name)}`;

  // HÀM GỌI API XÁC NHẬN VỀ BACKEND
  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/request-pro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        alert("Hệ thống đã ghi nhận! Vui lòng chờ 1-5 phút để AI Dojo duyệt giao dịch của bạn.");
        setShowModal(false);
        // Lưu ý: Bạn nên gọi hàm refresh user profile ở đây để cập nhật UI ngay lập tức
      } else {
        alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Payment Confirmation Error:", error);
      alert("Không thể kết nối đến máy chủ.");
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
      onClick: () => {},
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
      // Đổi chữ trên nút nếu đang chờ duyệt
      buttonText: user?.is_pending_pro ? "Đang chờ duyệt..." : "Nâng cấp lên PRO",
      isCurrent: user?.plan === "PRO" || user?.is_pending_pro,
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
                <QrCode size={24} />
              </div>

              <h3 className="text-xl font-black mb-1 px-4">Nâng cấp tài khoản</h3>
              <p className="text-slate-500 text-xs mb-6">Quét mã để thanh toán tự động qua App Ngân hàng</p>

              <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-slate-100 mb-6">
                <img src={qrUrl} alt="VietQR" className="w-full aspect-square rounded-xl shadow-sm" />
              </div>

              <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
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
                disabled={isSubmitting}
                onClick={handleConfirmPayment}
                className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? "ĐANG GỬI..." : "XÁC NHẬN ĐÃ CHUYỂN TIỀN"}
              </button>

              <p className="mt-4 text-[10px] text-slate-400 leading-relaxed italic">
                * Sau khi quét mã thành công, nhấn nút trên để thông báo cho đội ngũ hỗ trợ.
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