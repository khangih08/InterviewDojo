'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function useInterviewSession(roomId?: string) {
  const router = useRouter();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(roomId || null);
  const [activeTab, setActiveTab] = useState<'THEORY' | 'CODING' | 'EVALUATION'>('THEORY');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; phase?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/interviews';
  const USER_ID = user?.id || '';

  // [MỚI]: Kiểm tra tương tác thực tế của người dùng
  const hasUserInteracted = useMemo(() => {
    return messages.some(msg => msg.role === 'user' && msg.content.trim().length > 0);
  }, [messages]);

  // Tự động cuộn xuống
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Khôi phục phiên từ RoomId (URL)
  const restoreInterviewState = useCallback(async (id: string) => {
    if (!USER_ID) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/${id}/state?userId=${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setInterviewId(data.interviewId || id);
        setActiveTab(data.currentPhase || 'THEORY');
        setMessages(data.chatHistory || []);
      }
    } catch (error) {
      console.error("Lỗi khôi phục trạng thái:", error);
    } finally {
      setIsLoading(false);
    }
  }, [USER_ID, BACKEND_URL]);

  useEffect(() => {
    if (roomId && USER_ID) {
      restoreInterviewState(roomId);
    }
  }, [roomId, USER_ID, restoreInterviewState]);

  // Hàm Start (Dùng cho màn hình Setup)
  const startInterview = async () => {
    if (!file) return alert('Vui lòng chọn CV!');
    if (!USER_ID) return alert('Vui lòng đăng nhập!');

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', USER_ID);
    try {
      const res = await fetch(`${BACKEND_URL}/start-with-cv`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.id) {
        router.push(`/interview/${data.id}`);
      }
    } catch (error) {
      console.error("Lỗi khởi tạo phỏng vấn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi tin nhắn Text & Stream (Giữ nguyên logic Metadata phức tạp của bạn)
  const sendMessage = async (codeSnippet: string, codeOutput: string, emotion: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const targetId = interviewId || roomId;
    if (!input.trim() || !targetId) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText, phase: activeTab }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/${targetId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          message: userText,
          activeTab: activeTab,
          codeSnippet,
          terminalOutput: codeOutput,
          emotion
        }),
      });

      if (!response.body) throw new Error("No body");
      setMessages(prev => [...prev, { role: 'assistant', content: '', phase: activeTab }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value, { stream: !done });
          accumulatedText += chunkValue;

          if (accumulatedText.includes('__METADATA__')) {
            const parts = accumulatedText.split('__METADATA__');
            const chatText = parts[0];
            const metaText = parts[1];

            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: chatText };
              return updated;
            });

            try {
              if (metaText.trim()) {
                const meta = JSON.parse(metaText);
                const nextPhase = meta.current_phase || meta.active_tab || meta.next_action;
                if (nextPhase) {
                  if (nextPhase.includes('CODING')) setActiveTab('CODING');
                  else if (nextPhase.includes('THEORY')) setActiveTab('THEORY');
                  else if (nextPhase.includes('EVALUATION') || nextPhase.includes('FINISH')) setActiveTab('EVALUATION');
                }
              }
            } catch (e) {
              console.error("Lỗi parse metadata:", e);
            }
          } else {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulatedText };
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error("Lỗi streaming:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic Ghi âm (Giữ nguyên 100%)
  const toggleRecording = async (codeSnippet: string, codeOutput: string, emotion: string) => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];
        mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          await sendAudioMessage(audioBlob, codeSnippet, codeOutput, emotion);
        };
        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Vui lòng cấp quyền Micro!");
      }
    }
  };

  const sendAudioMessage = async (blob: Blob, codeSnippet: string, codeOutput: string, emotion: string) => {
    const targetId = interviewId || roomId;
    if (!targetId) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'user_voice.webm');
    formData.append('userId', USER_ID);
    formData.append('activeTab', activeTab);
    formData.append('emotion', emotion);
    formData.append('codeSnippet', codeSnippet);
    formData.append('terminalOutput', codeOutput);

    try {
      const res = await fetch(`${BACKEND_URL}/${targetId}/chat-audio`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.recognizedText) {
        setMessages(prev => [...prev, { role: 'user', content: data.recognizedText, phase: activeTab }]);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, phase: data.current_phase || activeTab }]);

      const nextPhase = data.current_phase || data.active_tab || data.next_action;
      if (nextPhase) {
        if (nextPhase.includes('CODING')) setActiveTab('CODING');
        else if (nextPhase.includes('THEORY')) setActiveTab('THEORY');
        else if (nextPhase.includes('EVALUATION') || nextPhase.includes('FINISH')) setActiveTab('EVALUATION');
      }
    } catch (error) {
      console.error("Lỗi gửi audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReport = async () => {
    const targetId = interviewId || roomId;
    if (!targetId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/${targetId}/report`);
      const data = await res.json();
      if (data && (data.avgScore !== undefined || data.summary)) {
        setReport(data);
      } else {
        alert("AI vẫn đang tổng hợp kết quả, vui lòng đợi vài giây!");
      }
    } catch (error) {
      console.error("Lỗi lấy báo cáo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    router.push('/dashboard');
  };

  return {
    file, setFile, interviewId, activeTab, setActiveTab,
    messages, input, setInput, isLoading, report, setReport,
    isRecording, messagesEndRef, startInterview, sendMessage,
    toggleRecording, fetchReport, handleReset, hasUserInteracted
  };
}