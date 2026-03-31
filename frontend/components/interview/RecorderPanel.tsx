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

  const currentStatus: UiStatus =
    uiStatus === "uploading" || uiStatus === "done" || uiStatus === "error"
      ? uiStatus
      : status;

  const handleEnableDevices = async () => {
    await setupDevices();
    setUiStatus("ready");
  };

  const handleStart = () => {
    startRecording();
    setUiStatus("recording");
  };

  const handleStop = () => {
    stopRecording();
    setUiStatus("stopped");
  };

  const handleUpload = async () => {
    if (!recordedVideo) return;

    try {
      setSubmitError("");
      setUiStatus("uploading");
      setUploadProgress(0);

      const fileName = `interview-${Date.now()}.webm`;

      const session = await createSession({
        question_id: questionId,
      });

      const presign = await getPresignedUploadUrl({
        session_id: session.session_id,
        file_name: fileName,
        content_type: recordedVideo.mimeType,
        size_bytes: recordedVideo.sizeBytes,
      });

      await uploadFileToS3({
        uploadUrl: presign.upload_url,
        file: recordedVideo.blob,
        contentType: recordedVideo.mimeType,
        headers: presign.headers,
        onProgress: (percent) => setUploadProgress(percent),
      });

      await completeSession({
        session_id: session.session_id,
        recording_url: presign.file_url,
        duration_seconds: 0,
        size_bytes: recordedVideo.sizeBytes,
        mime_type: recordedVideo.mimeType,
      });

      setUiStatus("done");
    } catch (uploadError) {
      console.error(uploadError);
      setSubmitError(
        uploadError instanceof Error ? uploadError.message : "Upload tháº¥t báº¡i."
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
          disabled={
            currentStatus === "recording" || currentStatus === "uploading"
          }
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
          onClick={resetRecording}
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
          <p className="text-sm font-medium">Video Ä‘Ã£ quay</p>
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
