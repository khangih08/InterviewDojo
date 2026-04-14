"use client";

import { AlertTriangle, CheckCircle2, Clock3, Mic, Volume2 } from "lucide-react";

type Props = {
  status:
    | "idle"
    | "ready"
    | "recording"
    | "uploading"
    | "done"
    | "error"
    | "stopped";
  progress?: number;
  error?: string;
  remainingSec?: number;
  elapsedSec?: number;
  maxDurationSec?: number;
  recordingProgressPercent?: number;
  volumeLevel?: number;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getProgressWidthClass(value: number) {
  const bucket = Math.max(0, Math.min(20, Math.round(value / 5)));

  return [
    "w-0",
    "w-[5%]",
    "w-[10%]",
    "w-[15%]",
    "w-[20%]",
    "w-[25%]",
    "w-[30%]",
    "w-[35%]",
    "w-[40%]",
    "w-[45%]",
    "w-1/2",
    "w-[55%]",
    "w-[60%]",
    "w-[65%]",
    "w-[70%]",
    "w-[75%]",
    "w-[80%]",
    "w-[85%]",
    "w-[90%]",
    "w-[95%]",
    "w-full",
  ][bucket];
}

export default function RecordingStatus({
  status,
  progress = 0,
  error,
  remainingSec = 0,
  elapsedSec = 0,
  maxDurationSec = 120,
  recordingProgressPercent = 0,
  volumeLevel = 0,
}: Props) {
  const map = {
    idle: "Chưa sẵn sàng",
    ready: "Sẵn sàng ghi",
    recording: "Đang ghi âm",
    stopped: "Đã dừng",
    uploading: "Đang tải lên",
    done: "Hoàn tất",
    error: "Có lỗi xảy ra",
  };

  const isRecording = status === "recording";
  const isUploading = status === "uploading";
  const isError = status === "error";
  const isDone = status === "done";

  const toneClass = isError
    ? "border-rose-200 bg-rose-50 text-rose-800"
    : isDone
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : isRecording
        ? "border-violet-200 bg-violet-50 text-violet-800"
        : "border-slate-200 bg-white text-slate-800";

  return (
    <div className={`space-y-4 rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
            Recording status
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {isError ? (
              <AlertTriangle className="h-4 w-4" />
            ) : isDone ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : isRecording ? (
              <Mic className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
            <span>{map[status]}</span>
          </div>
        </div>

        {isRecording ? (
          <div className="min-w-30 rounded-2xl bg-slate-950 px-3 py-2 text-right text-white shadow-lg">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">
              Countdown
            </p>
            <p className="text-2xl font-semibold leading-none">
              {formatTime(remainingSec)}
            </p>
          </div>
        ) : null}
      </div>

      {isRecording ? (
        <div className="space-y-3 rounded-2xl border border-violet-200 bg-white/70 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Elapsed {formatTime(elapsedSec)}</span>
            <span>Max {formatTime(maxDurationSec)}</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-rose-500 transition-all duration-300 ${getProgressWidthClass(
                recordingProgressPercent,
              )}`}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Volume2 className="h-4 w-4" />
              <span>Mic level</span>
            </div>

            <div className="flex h-8 items-end gap-1.5">
              {[0, 1, 2, 3, 4].map((bar) => {
                const active = volumeLevel >= (bar + 1) * 20;
                const heights = ["h-4", "h-5", "h-6", "h-7", "h-8"];

                return (
                  <span
                    key={bar}
                    className={`w-1.5 rounded-full transition-all duration-150 ${heights[bar]} ${
                      active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {isUploading ? (
        <div className="space-y-2 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-sky-700">
            <span>Uploading video</span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-sky-100">
            <div
              className={`h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-400 transition-all duration-300 ${getProgressWidthClass(
                progress,
              )}`}
            />
          </div>
        </div>
      ) : null}

      {!isRecording && !isUploading ? (
        <div className="rounded-2xl border border-dashed border-current/15 bg-white/70 p-4 text-sm">
          {isDone ? (
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Video đã sẵn sàng để xem kết quả.</span>
            </div>
          ) : isError ? (
            <div className="space-y-2 text-rose-700">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>Không thể hoàn tất thao tác</span>
              </div>
              {error ? <p className="text-sm leading-6">{error}</p> : null}
            </div>
          ) : (
            <p className="text-slate-600">
              Bật camera, ghi lại câu trả lời, rồi tải lên để nhận phản hồi.
            </p>
          )}
        </div>
      ) : null}

      {error && !isError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}