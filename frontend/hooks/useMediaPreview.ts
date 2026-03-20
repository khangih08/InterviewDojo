"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useMediaPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const stop = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setEnabled(false);
  }, [stream]);

  const start = useCallback(async () => {
    try {
      setError(null);
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(media);
      setEnabled(true);
    } catch {
      setError("Không thể truy cập camera / microphone. Hãy kiểm tra quyền trình duyệt.");
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    error,
    enabled,
    start,
    stop,
  };
}
