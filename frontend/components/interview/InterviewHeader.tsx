import { useState, useEffect } from 'react';
import { BookOpen, Code, FileText, Video, Zap, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Sử dụng Router của Next.js để chuyển hướng

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-black tracking-tighter ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-200'}`}>
      {icon}<span className="text-[11px] uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function InterviewHeader({
  interviewId, activeTab, setActiveTab, handleReset,
  isCameraOn, isAiObserving, emotion, videoRef, toggleCamera
}: any) {
  const router = useRouter();

  // State cục bộ theo dõi trạng thái xem báo cáo và hiển thị popup cảnh báo
  const [hasViewedReport, setHasViewedReport] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // useEffect tự động lắng nghe: Chỉ cần activeTab chuyển thành 'EVALUATION', ghi nhận ngay lập tức
  useEffect(() => {
    if (activeTab === 'EVALUATION') {
      setHasViewedReport(true);
    }
  }, [activeTab]);

  // Hàm chặn sự kiện thoát để kiểm tra điều kiện
  const handleExitClick = () => {
    if (!hasViewedReport) {
      setShowExitWarning(true); // Chưa xem báo cáo -> Kích hoạt hiển thị Popup cảnh báo
    } else {
      router.push('/dashboard'); // Đã xem -> Cho phép điều hướng ra dashboard bình thường
    }
  };

  return (
    <>
      <header className="bg-[#1e293b] border-b border-slate-700 p-4 flex justify-between items-center shadow-2xl z-10 w-full">

        {/* --- PHẦN TRÁI: Nút Thoát và Logo --- */}
        <div className="flex items-center gap-6">
          {/* THAY ĐỔI: Chuyển Link thành button để bắt sự kiện handleExitClick */}
          <button
            onClick={handleExitClick}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700/50 cursor-pointer text-left"
          >
            <ChevronLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Thoát</span>
          </button>

          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent cursor-pointer" onClick={handleReset}>
            InterviewDojo <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full ml-1 border border-blue-500/30">PRO AI</span>
          </h1>
        </div>

        {/* --- PHẦN GIỮA: Các Tabs (Chỉ hiện khi có interviewId) --- */}
        {interviewId && (
          <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-slate-700">
            <TabBtn active={activeTab === 'THEORY'} onClick={() => setActiveTab('THEORY')} icon={<BookOpen size={16}/>} label="Lý Thuyết" />
            <TabBtn active={activeTab === 'CODING'} onClick={() => setActiveTab('CODING')} icon={<Code size={16}/>} label="Thực Hành" />
            <TabBtn active={activeTab === 'EVALUATION'} onClick={() => setActiveTab('EVALUATION')} icon={<FileText size={16}/>} label="Kết Quả" />
          </div>
        )}

        {/* --- PHẦN PHẢI: Camera và Nút Bật/Tắt --- */}
        <div className="flex items-center gap-4">
          <div className={`relative w-44 h-28 bg-black rounded-2xl overflow-hidden border-2 transition-all duration-500 shadow-lg ${isAiObserving ? 'border-emerald-500/50' : 'border-slate-700'}`}>
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-900/50">
                <Video size={24} className="opacity-20" />
                <span className="text-[9px] font-bold uppercase">Signal Lost</span>
              </div>
            )}
            <video ref={videoRef} autoPlay muted className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${!isCameraOn ? 'opacity-0' : 'opacity-100'}`} />
            {isCameraOn && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center gap-1.5">
                  <Zap size={10} className={isAiObserving ? "text-yellow-400 fill-yellow-400" : "text-slate-500"} />
                  <span className="text-[10px] font-black text-white uppercase">{isAiObserving ? emotion : "Đang tìm mặt..."}</span>
                </div>
              </div>
            )}
          </div>
          <button onClick={toggleCamera} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${isCameraOn ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/40'}`}>
            {isCameraOn ? 'TẮT CAMERA' : 'BẬT AI CAMERA'}
          </button>
        </div>
      </header>

     {/* --- POPUP CẢNH BÁO THOÁT (Chỉ render khi kích hoạt) --- */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl max-w-md w-full shadow-2xl transform transition-all">

            <h3 className="text-[15px] font-bold text-[#fb923c] uppercase tracking-wide mb-4 flex items-center gap-2">
              ⚠️ Cảnh báo kết thúc phòng
            </h3>

            <p className="text-slate-300 text-[13px] leading-relaxed mb-8">
              Bạn chưa xem <span className="text-blue-400 font-bold uppercase">Kết Quả</span> đánh giá của AI. Nếu thoát bây giờ, phiên phỏng vấn này sẽ kết thúc hoàn toàn và bạn <span className="text-red-500 font-bold">không thể quay lại</span> cuộc phỏng vấn này được nữa.
            </p>

            <div className="flex justify-end gap-3 text-sm font-semibold">
              <button
                onClick={() => setShowExitWarning(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-600/50 cursor-pointer"
              >
                Ở lại phòng
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2 rounded-xl bg-[#e11d48] hover:bg-red-600 text-white transition-all shadow-lg shadow-red-900/40 cursor-pointer"
              >
                Xác nhận thoát
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}