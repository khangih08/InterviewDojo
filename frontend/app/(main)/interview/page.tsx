"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, User, Bot, Zap, FileText, CheckCircle2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

export default function InterviewAgentPage() {
  const [step, setStep] = useState<"SELECT" | "CHAT">("SELECT");
  const [interviewId, setInterviewId] = useState<string>("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);


  const handleStartFree = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "FREE" }),
      });
      const data = await res.json();

      if (data.success) {
        setInterviewId(data.interviewId);
        setMessages([{ role: "assistant", content: data.firstMessage || "Chào bạn, chúng ta bắt đầu nhé. Bạn muốn phỏng vấn về chủ đề gì?" }]);
        setStep("CHAT");
      } else {
        alert(data.message || "Không thể bắt đầu phỏng vấn!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối đến server!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTargeted = async () => {
    if (!cvFile) return alert("Vui lòng tải lên CV của bạn (định dạng PDF)!");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "TARGETED");
      formData.append("cvFile", cvFile);
      formData.append("jobDescription", jdText);

      const res = await fetch(`${API_BASE_URL}/interviews/start`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setInterviewId(data.interviewId);
        setMessages([{ role: "assistant", content: data.firstMessage || "Tôi đã đọc xong CV của bạn. Hãy giới thiệu một chút về bản thân nhé!" }]);
        setStep("CHAT");
      } else {
        alert(data.message || "Có lỗi xảy ra khi phân tích CV!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi khi kết nối hoặc phân tích CV!");
    } finally {
      setIsLoading(false);
    }
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = handleAudioStop;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Lỗi truy cập Micro:", error);
      alert("Vui lòng cấp quyền sử dụng Micro trên trình duyệt!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioStop = async () => {
    if (!interviewId) {
      alert("Không tìm thấy mã phiên phỏng vấn!");
      return;
    }

    setIsLoading(true);

    setMessages(prev => [...prev, { role: "user", content: "🎤 Đang bóc băng ghi âm..." }]);

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("interviewId", interviewId);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}/interviews/upload-audio`, {
        method: "POST",
        body: formData,
      });
      const data = await uploadRes.json();

      if (!data.success) throw new Error(data.message || "Lỗi xử lý âm thanh từ Server");

      const finalUserText = data.userText || "🎤 (Không nhận diện được giọng nói)";
      const finalAiText = data.aiResponse || "Xin lỗi, tôi chưa nghe rõ câu trả lời của bạn.";

      setMessages((prev) => {
        const filteredMessages = prev.filter(msg => msg.content !== "🎤 Đang bóc băng ghi âm...");
        return [
          ...filteredMessages,
          { role: "user" as const, content: finalUserText },
          { role: "assistant" as const, content: finalAiText }
        ];
      });

    } catch (error: any) {
      console.error("Lỗi xử lý luồng:", error);
      alert(error.message || "Có lỗi xảy ra khi trò chuyện với AI.");

      setMessages(prev => prev.filter(msg => msg.content !== "🎤 Đang bóc băng ghi âm..."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#080c18] px-4 py-8 flex flex-col">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl flex-1 flex flex-col space-y-6">

        {/* Header */}
        <div className="space-y-1 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            AI Interview Agent
          </h2>
          <p className="text-sm text-slate-400">
            {step === "SELECT" ? "Chọn chế độ phỏng vấn để bắt đầu" : "Trò chuyện trực tiếp bằng giọng nói với nhà tuyển dụng AI"}
          </p>
        </div>

        {/* ================= STEP 1: CHỌN CHẾ ĐỘ ================= */}
        {step === "SELECT" && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Option 1: Free mode */}
            <Glass className="p-6 flex flex-col items-center text-center space-y-6 hover:border-indigo-500/50 transition-all">
              <div className="p-4 bg-indigo-500/20 rounded-full text-indigo-400">
                <Zap size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Luyện tập tự do</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Trò chuyện trực tiếp với AI để rèn luyện kỹ năng phản xạ và giao tiếp cơ bản mà không cần chuẩn bị trước.
                </p>
              </div>
              <button
                onClick={handleStartFree}
                disabled={isLoading}
                className="mt-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold w-full flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Bắt đầu ngay"}
              </button>
            </Glass>

            {/* Option 2: Targeted mode */}
            <Glass className="p-6 flex flex-col items-center text-center space-y-4 hover:border-teal-500/50 transition-all">
              <div className="p-4 bg-teal-500/20 rounded-full text-teal-400">
                <FileText size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Phỏng vấn sát thực tế</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Tải CV và nhập JD để AI phân tích và đưa ra các câu hỏi xoáy sâu vào chuyên môn của bạn.
                </p>
              </div>

              <div className="w-full space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Upload CV (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-300 hover:file:bg-teal-500/30 cursor-pointer bg-black/20 rounded-xl border border-white/5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Mô tả công việc (JD)</label>
                  <textarea
                    placeholder="Dán nội dung JD vào đây để AI đóng vai chuẩn xác nhất..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full h-24 p-3 bg-black/20 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-teal-500/50 text-white placeholder-slate-500 scrollbar-thin"
                  />
                </div>
              </div>

              <button
                onClick={handleStartTargeted}
                disabled={isLoading}
                className="mt-auto px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold w-full flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(13,148,136,0.2)]"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Phân tích & Phỏng vấn"}
              </button>
            </Glass>
          </div>
        )}

        {/* ================= STEP 2: KHUNG CHAT ================= */}
        {step === "CHAT" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if(confirm("Bạn có chắc muốn kết thúc?")) {
                    setStep("SELECT");
                    setMessages([]); // Dọn dẹp tin nhắn cũ khi thoát ra
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold rounded-lg transition-colors border border-rose-500/20"
              >
                <CheckCircle2 size={18} />
                Kết thúc phiên
              </button>
            </div>

            <Glass className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-h-[55vh] scrollbar-thin scrollbar-thumb-indigo-500/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${
                    msg.role === "user" ? "bg-indigo-500/20 ring-indigo-500/50 text-indigo-300" : "bg-teal-500/20 ring-teal-500/50 text-teal-300"
                  }`}>
                    {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600/20 text-indigo-100 rounded-tr-sm border border-indigo-500/20"
                      : "bg-white/5 text-slate-200 rounded-tl-sm border border-white/10"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/20 ring-1 ring-teal-500/50 text-teal-300">
                    <Bot size={20} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 p-4 text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI đang lắng nghe & phản hồi...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </Glass>

            {/* Khung điều khiển ghi âm */}
            <div className="flex justify-center pb-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isLoading}
                  className={`group relative flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:scale-100`}
                >
                  <Mic className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400 opacity-0 transition-all group-hover:scale-150 group-hover:opacity-20" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
                >
                  <Square className="h-8 w-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-75" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}