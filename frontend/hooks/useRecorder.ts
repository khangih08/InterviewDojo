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
  const [elapsedSec, setElapsedSec] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const maxDurationSec = 120;

  const mimeType = useMemo(() => getSupportedMimeType(), []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }

    sourceRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    setVolumeLevel(0);
  }, []);

  const startAudioMeter = useCallback(() => {
    if (!streamRef.current || typeof window === "undefined") return;

    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) return;

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(streamRef.current);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(buffer);

      let sum = 0;
      for (const value of buffer) {
        sum += value;
      }

      const average = sum / buffer.length;
      setVolumeLevel(Math.min(100, Math.round((average / 255) * 100)));
      rafRef.current = window.requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setElapsedSec(0);

    timerRef.current = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= maxDurationSec) {
          stopTimer();
          recorderRef.current?.stop();
          return maxDurationSec;
        }

        return prev + 1;
      });
    }, 1000);
  }, [maxDurationSec, stopTimer]);

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
      return true;
    } catch (err) {
      console.error(err);
      setError("Không thể truy cập camera hoặc microphone.");
      setStatus("error");
      return false;
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
      stopTimer();
      stopAudioMeter();

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
        stopTimer();
        stopAudioMeter();

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
      startTimer();
      startAudioMeter();
      setStatus("recording");
      return true;
    } catch (err) {
      console.error(err);
      setError("Không thể bắt đầu recording.");
      setStatus("error");
      stopTimer();
      stopAudioMeter();
      return false;
    }
  }, [mimeType, startAudioMeter, startTimer, stopAudioMeter, stopTimer]);

  const stopRecording = useCallback(() => {
    try {
      if (!recorderRef.current) return;
      if (recorderRef.current.state === "inactive") return;

      stopTimer();
      recorderRef.current.stop();
      return true;
    } catch (err) {
      console.error(err);
      setError("Không thể dừng recording.");
      setStatus("error");
      stopTimer();
      stopAudioMeter();
      return false;
    }
  }, [stopAudioMeter, stopTimer]);

  const resetRecording = useCallback(() => {
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
    }

    stopTimer();
    stopAudioMeter();
    setRecordedVideo(null);
    setError("");
    setElapsedSec(0);
    setStatus(streamRef.current ? "ready" : "idle");
  }, [recordedVideo, stopAudioMeter, stopTimer]);

  const stopDevices = useCallback(() => {
    stopTimer();
    stopAudioMeter();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }

    setStatus("idle");
  }, [stopAudioMeter, stopTimer]);

  const remainingSec = Math.max(0, maxDurationSec - elapsedSec);
  const recordingProgressPercent = Math.min(
    100,
    Math.round((elapsedSec / maxDurationSec) * 100),
  );

  return {
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
  };
}