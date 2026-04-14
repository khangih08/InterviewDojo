"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraOff, Upload } from "lucide-react";

import RecordingStatus from "@/components/interview/RecordingStatus";
import { Button } from "@/components/ui/button";
import { useRecorder } from "@/hooks/useRecorder";

interface QuestionData {
  id: string;
  content: string;
  sampleAnswer: string;
  difficultyLevel: number;
  categoryId: string;
  categoryName: string;
  tags: string[];
  createdAt: string;
}

type Props = {
  question: QuestionData | null;
};

type UiStatus =
  | "idle"
  | "ready"
  | "recording"
  | "stopped"
  | "uploading"
  | "done"
  | "error";

type StoredInterviewResult = {
  sessionId: string;
  status: "processing" | "done";
  transcript: string;
  feedback: string;
  questionId: string;
  createdAt: string;
  technicalScore?: number;
  communicationScore?: number;
  metrics?: Array<{ label: string; score: number }>;
};

function deriveMockScores(transcript: string, feedback: string) {
  const transcriptLength = transcript.trim().length;
  const feedbackLength = feedback.trim().length;

  const technicalScore = Math.max(
    45,
    Math.min(92, Math.round(55 + transcriptLength / 18)),
  );

  const communicationScore = Math.max(
    40,
    Math.min(95, Math.round(50 + feedbackLength / 7)),
  );

  const metrics = [
    { label: "Technical", score: technicalScore },
    { label: "Communication", score: communicationScore },
    {
      label: "Depth",
      score: Math.max(
        40,
        Math.min(
          95,
          Math.round(technicalScore * 0.9 + communicationScore * 0.1),
        ),
      ),
    },
    {
      label: "Clarity",
      score: Math.max(
        40,
        Math.min(
          95,
          Math.round(communicationScore * 0.9 + technicalScore * 0.1),
        ),
      ),
    },
    {
      label: "Balance",
      score: Math.max(
        40,
        Math.min(95, Math.round((technicalScore + communicationScore) / 2)),
      ),
    },
  ];

  return { technicalScore, communicationScore, metrics };
}

export default function RecorderPanel({ question }: Props) {
  const router = useRouter();

  const {
    status,
    error,
    recordedVideo,
    previewVideoRef,
    elapsedSec,
    remainingSec,
    maxDurationSec,
    recordingProgressPercent,
    volumeLevel,
    setupDevices,
    startRecording,
    stopRecording,
    resetRecording,
    stopDevices,
  } = useRecorder();

  const [uiStatus, setUiStatus] = useState<UiStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    return () => {
      stopDevices();
    };
  }, [stopDevices]);

  const currentStatus: UiStatus =
    uiStatus === "uploading" || uiStatus === "done" || uiStatus === "error"
      ? uiStatus
      : status;

  const handleEnableDevices = async () => {
    const isReady = await setupDevices();
    setUiStatus(isReady ? "ready" : "error");
  };

  const handleStart = () => {
    const started = startRecording();

    if (started) {
      setUiStatus("recording");
      setUploadProgress(0);
      setSubmitError("");
    } else {
      setUiStatus("error");
    }
  };

  const handleStop = () => {
    const stopped = stopRecording();

    if (stopped !== false) {
      setUiStatus("stopped");
    }
  };

  const handleRetryRecording = () => {
    resetRecording();
    setUploadProgress(0);
    setSubmitError("");

    const restarted = startRecording();

    if (restarted) {
      setUiStatus("recording");
    } else {
      setUiStatus("error");
    }
  };

  const handleReset = () => {
    resetRecording();
    setUiStatus("idle");
    setUploadProgress(0);
    setSubmitError("");
  };

  const handleDisableDevices = () => {
    stopDevices();
    setUiStatus("idle");
    setUploadProgress(0);
    setSubmitError("");
  };

  const handleUpload = async () => {
    if (!recordedVideo || !question) return; // Đảm bảo đã có cả video và dữ liệu câu hỏi

    const confirmed = window.confirm(
      "Ban co chac muon gui video nay de cham diem khong?",
    );

    if (!confirmed) return;

    let progressTimer: number | null = null;

    try {
      setSubmitError("");
      setUiStatus("uploading");
      setUploadProgress(10);

      progressTimer = window.setInterval(() => {
        setUploadProgress((current) => (current >= 92 ? current : current + 6));
      }, 250);

      const fileName = `interview-${Date.now()}.webm`;
      const formData = new FormData();
      formData.append("file", recordedVideo.blob, fileName);

      formData.append("question", question.content);
      formData.append("sampleAnswer", question.sampleAnswer);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/upload-audio`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Loi ${response.status}: ${errorDetail}`);
      }

      const data = await response.json();

      if (!data?.success) {
        throw new Error("Backend khong tra ve ket qua hop le.");
      }

      const { technicalScore, communicationScore, metrics } = deriveMockScores(
        data.transcript ?? "",
        data.feedback ?? "",
      );

      const sessionId = `local-${Date.now()}`;
      const payload: StoredInterviewResult = {
        sessionId,
        status: "processing",
        transcript: data.transcript ?? "",
        feedback: data.feedback ?? "",
        questionId: question.id,
        createdAt: new Date().toISOString(),
        technicalScore,
        communicationScore,
        metrics,
      };

      sessionStorage.setItem("interview:lastSessionId", sessionId);
      sessionStorage.setItem("interview:lastResult", JSON.stringify(payload));

      setUploadProgress(100);
      setUiStatus("done");

      router.push(`/result?sessionId=${encodeURIComponent(sessionId)}`);
    } catch (uploadError) {
      console.error(uploadError);

      if (!navigator.onLine) {
        setSubmitError("Network fail: mat ket noi internet. Vui long thu lai.");
      } else if (uploadError instanceof TypeError) {
        setSubmitError("Network fail: khong the ket noi den may chu.");
      } else if (uploadError instanceof Error) {
        setSubmitError(`Upload fail: ${uploadError.message}`);
      } else {
        setSubmitError("Upload fail: khong the tai file len.");
      }

      setUiStatus("error");
    } finally {
      if (progressTimer !== null) {
        window.clearInterval(progressTimer);
      }
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
        {status === "idle" ? (
          <Button
            onClick={handleEnableDevices}
            disabled={currentStatus === "uploading"}
          >
            Turn on camera & mic
          </Button>
        ) : null}

        <Button
          onClick={handleStart}
          disabled={status !== "ready" && status !== "stopped"}
        >
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
          variant="outline"
          onClick={handleDisableDevices}
          disabled={currentStatus === "uploading" || status === "idle"}
        >
          <CameraOff className="mr-2 h-4 w-4" />
          Turn off camera & mic
        </Button>

        <Button
          variant="secondary"
          onClick={handleRetryRecording}
          disabled={status !== "stopped" && currentStatus !== "error"}
        >
          Retry recording
        </Button>

        <Button
          onClick={handleUpload}
          disabled={
            !recordedVideo ||
            currentStatus === "uploading" ||
            currentStatus === "recording"
          }
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <RecordingStatus
        status={currentStatus}
        progress={uploadProgress}
        error={submitError || error}
        remainingSec={remainingSec}
        elapsedSec={elapsedSec}
        maxDurationSec={maxDurationSec}
        recordingProgressPercent={recordingProgressPercent}
        volumeLevel={volumeLevel}
      />

      {recordedVideo ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Video da quay</p>
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
    </div>
  );
}