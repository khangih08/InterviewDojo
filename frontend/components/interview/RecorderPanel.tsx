"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import RecordingStatus from "@/components/interview/RecordingStatus";
import { useRecorder } from "@/hooks/useRecorder";
import { createSession, completeSession } from "@/lib/api/sessions";
import {
  getPresignedUploadUrl,
  uploadFileToS3,
} from "@/lib/api/uploads";

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
  const recorder = useRecorder();

  const [uiStatus, setUiStatus] = useState<UiStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");

  const currentStatus = useMemo<UiStatus>(() => {
    if (uiStatus === "uploading" || uiStatus === "done" || uiStatus === "error") {
      return uiStatus;
    }

    return recorder.status;
  }, [recorder.status, uiStatus]);

  const handleEnableDevices = async () => {
    await recorder.setupDevices();
    setUiStatus("ready");
  };

  const handleStart = () => {
    recorder.startRecording();
    setUiStatus("recording");
  };

  const handleStop = () => {
    recorder.stopRecording();
    setUiStatus("stopped");
  };

  const handleUpload = async () => {
    if (!recorder.recordedVideo) return;

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
        content_type: recorder.recordedVideo.mimeType,
        size_bytes: recorder.recordedVideo.sizeBytes,
      });

      await uploadFileToS3({
        uploadUrl: presign.upload_url,
        file: recorder.recordedVideo.blob,
        contentType: recorder.recordedVideo.mimeType,
        headers: presign.headers,
        onProgress: (percent) => setUploadProgress(percent),
      });

      await completeSession({
        session_id: session.session_id,
        recording_url: presign.file_url,
        duration_seconds: 0,
        size_bytes: recorder.recordedVideo.sizeBytes,
        mime_type: recorder.recordedVideo.mimeType,
      });

      setUiStatus("done");
    } catch (error) {
      console.error(error);
      setSubmitError(
        error instanceof Error ? error.message : "Upload thất bại."
      );
      setUiStatus("error");
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border p-6">
      <div className="overflow-hidden rounded-xl border bg-black">
        <video
          ref={recorder.previewVideoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleEnableDevices} disabled={currentStatus === "recording" || currentStatus === "uploading"}>
          Bật camera + mic
        </Button>

        <Button
          onClick={handleStart}
          disabled={
            recorder.status !== "ready" && recorder.status !== "stopped"
          }
        >
          Start
        </Button>

        <Button
          variant="destructive"
          onClick={handleStop}
          disabled={recorder.status !== "recording"}
        >
          Stop
        </Button>

        <Button
          variant="outline"
          onClick={recorder.resetRecording}
          disabled={currentStatus === "uploading"}
        >
          Reset
        </Button>

        <Button
          onClick={handleUpload}
          disabled={!recorder.recordedVideo || currentStatus === "uploading"}
        >
          Upload
        </Button>
      </div>

      <RecordingStatus
        status={currentStatus}
        progress={uploadProgress}
        error={submitError || recorder.error}
      />

      {recorder.recordedVideo ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Video đã quay</p>
          <video
            src={recorder.recordedVideo.url}
            controls
            className="aspect-video w-full rounded-xl border bg-black"
          />
          <p className="text-xs text-zinc-500">
            Size: {(recorder.recordedVideo.sizeBytes / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : null}
    </div>
  );
}