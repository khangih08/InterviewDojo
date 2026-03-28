"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type RecorderStatus =
  | "idle"
  | "ready"
  | "recording"
  | "stopped"
  | "error";

export type RecordedVideo = {
  blob: Blob;
  url: string;
  mimeType: string;
  sizeBytes: number;
};

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string>("");
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideo | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const mimeType = useMemo(() => getSupportedMimeType(), []);

  const setupDevices = useCallback(async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }

      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError("Không thể truy cập camera hoặc microphone.");
      setStatus("error");
    }
  }, []);

  const startRecording = useCallback(() => {
    try {
      if (!streamRef.current) {
        throw new Error("Chưa có media stream.");
      }

      setError("");
      setRecordedVideo(null);
      chunksRef.current = [];

      const recorder = new MediaRecorder(
        streamRef.current,
        mimeType ? { mimeType } : undefined
      );

      recorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "video/webm",
        });

        const objectUrl = URL.createObjectURL(finalBlob);

        setRecordedVideo({
          blob: finalBlob,
          url: objectUrl,
          mimeType: finalBlob.type || "video/webm",
          sizeBytes: finalBlob.size,
        });

        setStatus("stopped");
      };

      recorder.start();
      setStatus("recording");
    } catch (err) {
      console.error(err);
      setError("Không thể bắt đầu recording.");
      setStatus("error");
    }
  }, [mimeType]);

  const stopRecording = useCallback(() => {
    try {
      if (!recorderRef.current) return;
      if (recorderRef.current.state === "inactive") return;

      recorderRef.current.stop();
    } catch (err) {
      console.error(err);
      setError("Không thể dừng recording.");
      setStatus("error");
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
    }

    setRecordedVideo(null);
    setError("");
    setStatus(streamRef.current ? "ready" : "idle");
  }, [recordedVideo]);

  const stopDevices = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }

    setStatus("idle");
  }, []);

  return {
    status,
    error,
    recordedVideo,
    previewVideoRef,
    setupDevices,
    startRecording,
    stopRecording,
    resetRecording,
    stopDevices,
  };
}