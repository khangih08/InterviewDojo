import { useState, useRef, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export function useMediaPipeCamera() {
  const [emotion, setEmotion] = useState<string>('Bình thường');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAiObserving, setIsAiObserving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);

  // Khởi tạo AI Model
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO"
        });
      } catch (err) {
        console.error("❌ MediaPipe Error:", err);
      }
    };
    initMediaPipe();
  }, []);

  // Logic đoán cảm xúc
  const predictEmotion = (result: FaceLandmarkerResult) => {
    if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
      const shapes = result.faceBlendshapes[0].categories;
      const getScore = (name: string) => shapes.find(s => s.categoryName === name)?.score || 0;
      const smile = (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;
      const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;

      if (smile > 0.15) return 'Hào hứng';
      if (browDown > 0.2) return 'Đang suy nghĩ';
      return 'Bình thường';
    }
    return 'Bình thường';
  };

  // Vòng lặp check frame liên tục
  useEffect(() => {
    const processVideoFrame = () => {
      if (videoRef.current && faceLandmarkerRef.current && isCameraOn) {
        const video = videoRef.current;
        if (video.currentTime !== lastVideoTimeRef.current && video.videoWidth > 0) {
          lastVideoTimeRef.current = video.currentTime;
          try {
            const result = faceLandmarkerRef.current.detectForVideo(video, performance.now());
            if (result.faceLandmarks && result.faceLandmarks.length > 0) {
              setEmotion(predictEmotion(result));
              setIsAiObserving(true);
            } else {
              setIsAiObserving(false);
            }
          } catch (error) {}
        }
      }
      if (isCameraOn) requestRef.current = requestAnimationFrame(processVideoFrame);
    };
    if (isCameraOn) requestRef.current = requestAnimationFrame(processVideoFrame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isCameraOn]);

  // Bật/tắt Cam
  const toggleCamera = async () => {
    if (isCameraOn) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
      setIsAiObserving(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => setIsCameraOn(true);
        }
      } catch (err) { alert("Vui lòng cho phép quyền Camera!"); }
    }
  };

  return { emotion, isCameraOn, isAiObserving, videoRef, toggleCamera };
}