"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mic, Square, Loader2, User, Bot, Zap, FileText, CheckCircle2, Tag } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId");

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
        setMessages([{ role: "assistant", content: data.firstMessage || "Chào bạn, chúng ta bắt đầu nhé!" }]);
        setStep("CHAT");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTargeted = async () => {
    if (!cvFile) return alert("Vui lòng tải CV!");
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
        setMessages([{ role: "assistant", content: data.firstMessage || "Tôi đã đọc CV của bạn!" }]);
        setStep("CHAT");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorder.onstop = handleAudioStop;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleAudioStop = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: "🎤 Đang xử lý..." }]);
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("interviewId", interviewId);
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/upload-audio`, { method: "POST", body: formData });
      const data = await res.json();
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== "🎤 Đang xử lý...");
        return [...filtered, { role: "user", content: data.userText }, { role: "assistant", content: data.aiResponse }];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#080c18] px-4 py-8 flex flex-col text-white">
      <div className="relative mx-auto w-full max-w-4xl flex-1 flex flex-col space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">AI Interview Agent</h2>
          <p className="text-slate-400">Luyện tập phỏng vấn với AI</p>
        </div>

        {step === "SELECT" ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Glass className="p-6 space-y-4">
              <Zap className="text-indigo-400" size={36} />
              <h3 className="text-xl font-bold">Tự do</h3>
              <button onClick={handleStartFree} className="w-full py-3 bg-indigo-600 rounded-xl">Bắt đầu</button>
            </Glass>
            <Glass className="p-6 space-y-4">
              <FileText className="text-teal-400" size={36} />
              <h3 className="text-xl font-bold">Theo CV</h3>
              <input type="file" onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              <button onClick={handleStartTargeted} className="w-full py-3 bg-teal-600 rounded-xl">Phân tích</button>
            </Glass>
          </div>
        ) : (
          <Glass className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-4 rounded-xl ${msg.role === "user" ? "bg-indigo-600/20" : "bg-white/5"}`}>{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            <div className="flex justify-center pt-4">
              {!isRecording ? (
                <button onClick={startRecording} className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center"><Mic /></button>
              ) : (
                <button onClick={stopRecording} className="h-16 w-16 bg-rose-600 rounded-full flex items-center justify-center animate-pulse"><Square /></button>
              )}
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewPageContent />
    </Suspense>
  );
}