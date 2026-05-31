'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSandboxEditor } from '@/hooks/useSandboxEditor';
import { useMediaPipeCamera } from '@/hooks/useMediaPipeCamera';
import { useInterviewSession } from '@/hooks/useInterviewSession';

import InterviewHeader from '@/components/interview/InterviewHeader';
import InterviewChat from '@/components/interview/InterviewChat';
import InterviewWorkspace from '@/components/interview/InterviewWorkspace';
import EvaluationReport from '@/components/interview/EvaluationReport';
import { Lock, Zap, Crown } from 'lucide-react';

export default function InterviewRoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const { user } = useAuth();

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);

  const {
    codeSnippet, setCodeSnippet, codeOutput, setCodeOutput, isRunningCode, handleRunCode,
    language, handleLanguageChange
  } = useSandboxEditor();

  const {
    emotion, isCameraOn, isAiObserving, videoRef, toggleCamera
  } = useMediaPipeCamera();

  const {
    setFile, interviewId, activeTab, setActiveTab, messages, input, setInput,
    isLoading, report, setReport, isRecording, messagesEndRef,
    sendMessage, toggleRecording, fetchReport, handleReset
  } = useInterviewSession(roomId);

  const hasUserInteracted = messages.some(m => m.role === 'user');

  useEffect(() => {
    async function checkRoomState() {
      if (!roomId || !user?.id) return;
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${API_BASE}/interviews/${roomId}/state?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'COMPLETED') {
            setIsCompleted(true);
            setActiveTab('EVALUATION');
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra phòng thi:", error);
      } finally {
        setIsCheckingRoom(false);
      }
    }
    checkRoomState();
  }, [roomId, user, setActiveTab]);

  const onSendMessage = (e?: React.FormEvent) => {
    if (isCompleted) return;
    sendMessage(codeSnippet, codeOutput, emotion, e);
  };

  const onToggleRecording = () => {
    if (isCompleted) return;
    toggleRecording(codeSnippet, codeOutput, emotion);
  };

  const handleProtectedFetchReport = () => {
    if (!hasUserInteracted) {
      alert("Bạn chưa trả lời câu hỏi nào! AI cần dữ liệu để đánh giá năng lực của bạn.");
      return;
    }
    fetchReport();
  };

  if (isCheckingRoom) {
    return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic">Đang tải phiên phỏng vấn...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col h-screen overflow-hidden font-sans relative">

      {/* STATUS BAR: Hiển thị thông tin gói và lượt */}
      <div className="z-[60]">
        {isCompleted ? (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 flex items-center justify-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-widest">
            <Lock size={12} /> Chế độ biên bản - Phiên phỏng vấn này đã đóng
          </div>
        ) : (
          <div className="bg-emerald-500/5 border-b border-white/5 px-4 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
              <Zap size={12} fill="currentColor" />
              Luồng phỏng vấn hiện tại: {user?.plan === 'FREE' ? `Còn ${user.credits} lượt` : 'Gói PRO vô hạn'}
            </div>
            {user?.plan === 'FREE' && (
              <a href="/settings" className="text-[10px] font-bold text-white/50 hover:text-emerald-400 transition-colors flex items-center gap-1">
                <Crown size={10} /> Nâng cấp PRO
              </a>
            )}
          </div>
        )}
      </div>

      <InterviewHeader
        interviewId={roomId}
        activeTab={activeTab} setActiveTab={setActiveTab} handleReset={handleReset}
        isCameraOn={isCameraOn} isAiObserving={isAiObserving} emotion={emotion}
        videoRef={videoRef} toggleCamera={toggleCamera}
      />

      <main className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 flex overflow-hidden opacity-100 transition-opacity">
          {/* Lớp phủ chặn tương tác khi đã xong */}
          {isCompleted && <div className="absolute inset-0 z-40 bg-transparent cursor-not-allowed" style={{ pointerEvents: 'none' }} />}

          <InterviewChat
            activeTab={activeTab} messages={messages} input={input} setInput={setInput}
            isLoading={isLoading} isRecording={isRecording} messagesEndRef={messagesEndRef}
            onSendMessage={onSendMessage} onToggleRecording={onToggleRecording}
            fetchReport={handleProtectedFetchReport} handleReset={handleReset}
          />

          {activeTab === 'CODING' && (
            <InterviewWorkspace
              codeSnippet={codeSnippet} setCodeSnippet={setCodeSnippet}
              codeOutput={codeOutput} setCodeOutput={setCodeOutput}
              isRunningCode={isRunningCode} handleRunCode={handleRunCode}
              language={language} handleLanguageChange={handleLanguageChange}
            />
          )}
        </div>
      </main>

      {report && (
        <EvaluationReport report={report} setReport={setReport} />
      )}
    </div>
  );
}