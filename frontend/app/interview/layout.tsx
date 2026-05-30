import { ReactNode } from 'react';

export const metadata = {
  title: 'Phỏng Vấn AI Pro | InterviewDojo',
  description: 'Hệ thống phỏng vấn thử nghiệm thời gian thực được hỗ trợ bởi trí tuệ nhân tạo AI.',
};

interface InterviewLayoutProps {
  children: ReactNode;
}

export default function InterviewLayout({ children }: InterviewLayoutProps) {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#0f172a] text-slate-200 antialiased selection:bg-blue-500/30 selection:text-white">
      {/* Khung layout bao bọc toàn bộ trang phỏng vấn.
        Đảm bảo không có thanh cuộn (scrollbar) lạ xuất hiện ở rìa màn hình
      */}
      {children}
    </div>
  );
}