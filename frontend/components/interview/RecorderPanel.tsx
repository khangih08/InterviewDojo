"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import RecordingStatus from "@/components/interview/RecordingStatus";
import { useRecorder } from "@/hooks/useRecorder";
import { createSession, completeSession } from "@/lib/api/sessions";
import { getPresignedUploadUrl, uploadFileToS3 } from "@/lib/api/uploads";

type Props = {
  questionId: string;
};

type UiStatus =
  | "idle"
  | "ready"
  | "recording"
  | "stopped"
  | "uploading"
  | "done"
  | "error";

export default function RecorderPanel({ questionId }: Props) {
  const {
    status,
    error,
    recordedVideo,
    previewVideoRef,
    setupDevices,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecorder();

  const [uiStatus, setUiStatus] = useState<UiStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");

  // 🌟 THÊM STATE ĐỂ LƯU KẾT QUẢ TỪ AI
  const [aiResult, setAiResult] = useState<{ transcript: string; feedback: string } | null>(null);

  const currentStatus: UiStatus =
    uiStatus === "uploading" || uiStatus === "done" || uiStatus === "error"
      ? uiStatus
      : status;

  const handleEnableDevices = async () => {
    await setupDevices();
    setUiStatus("ready");
  };

  const handleStart = () => {
    setAiResult(null); // Xóa kết quả cũ khi bắt đầu quay lại
    startRecording();
    setUiStatus("recording");
  };

  const handleStop = () => {
    stopRecording();
    setUiStatus("stopped");
  };

  const handleReset = () => {
    setAiResult(null); // Xóa kết quả cũ khi reset
    resetRecording();
    setUiStatus("idle"); // Hoặc "ready" tùy logic của bạn
  };

  const handleUpload = async () => {
    if (!recordedVideo) return;

    try {
      setSubmitError("");
      setAiResult(null);
      setUiStatus("uploading");
      setUploadProgress(20);

      const fileName = `interview-${Date.now()}.webm`;

      console.log("Đang gửi video/audio và câu hỏi sang Backend...");

      const formData = new FormData();
      formData.append('file', recordedVideo.blob, fileName);

      // 🌟 GỬI KÈM CÂU HỎI LÊN BACKEND (Bạn có thể thay bằng câu hỏi thật truyền từ Props)
      formData.append('question', 'Sự khác nhau giữa Let, Var và Const trong JavaScript là gì?');


      const sttResponse = await fetch('http://127.0.0.1:8000/interviews/upload-audio', {
        method: 'POST',
        body: formData,
      });

      // 🌟 THÊM ĐOẠN NÀY ĐỂ BẮT TẬN TAY LỖI GÌ
      if (!sttResponse.ok) {
        const errorDetail = await sttResponse.text();
        console.error("❌ Chi tiết lỗi từ Backend:", errorDetail);
        throw new Error(`Lỗi ${sttResponse.status}: ${errorDetail}`);
      }
      const sttData = await sttResponse.json();
      console.log("✅ Kết quả AI trả về:", sttData);

      if (sttData.success) {
        // 🌟 LƯU KẾT QUẢ VÀO STATE THAY VÌ DÙNG ALERT
        setAiResult({
          transcript: sttData.transcript,
          feedback: sttData.feedback
        });
      }

      setUploadProgress(100);
      setUiStatus("done");

      // (Phần upload S3 tạm ẩn để test MVP)

    } catch (uploadError) {
      console.error(uploadError);
      setSubmitError(
        uploadError instanceof Error ? uploadError.message : "Upload thất bại."
      );
      setUiStatus("error");
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border p-6">
      <div className="overflow-hidden rounded-xl border bg-black">
        <video
          ref={previewVideoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleEnableDevices}
          disabled={currentStatus === "recording" || currentStatus === "uploading"}
        >
          Turn on camera & mic
        </Button>

        <Button onClick={handleStart} disabled={status !== "ready" && status !== "stopped"}>
          Start
        </Button>

        <Button
          variant="destructive"
          onClick={handleStop}
          disabled={status !== "recording"}
        >
          Stop
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          disabled={currentStatus === "uploading"}
        >
          Reset
        </Button>

        <Button
          onClick={handleUpload}
          disabled={!recordedVideo || currentStatus === "uploading"}
        >
          Upload
        </Button>
      </div>

      <RecordingStatus
        status={currentStatus}
        progress={uploadProgress}
        error={submitError || error}
      />

      {recordedVideo ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Video đã quay</p>
          <video
            src={recordedVideo.url}
            controls
            className="aspect-video w-full rounded-xl border bg-black"
          />
          <p className="text-xs text-zinc-500">
            Size: {(recordedVideo.sizeBytes / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : null}

      {/* 🌟 GIAO DIỆN HIỂN THỊ KẾT QUẢ AI ĐÁNH GIÁ */}
      {aiResult && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-400 mb-4">
            <span>🤖</span> AI Interviewer Feedback
          </h3>

          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 dark:bg-zinc-900 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500 mb-1">🗣️ Bạn đã nói:</p>
              <p className="text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
                "{aiResult.transcript}"
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 dark:bg-zinc-900 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500 mb-1">📝 Nhận xét & Chấm điểm:</p>
              <div className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {aiResult.feedback}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}