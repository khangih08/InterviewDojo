"use client";

type Props = {
  status: "idle" | "ready" | "recording" | "uploading" | "done" | "error" | "stopped";
  progress?: number;
  error?: string;
};

export default function RecordingStatus({ status, progress = 0, error }: Props) {
  const map = {
    idle: "Not ready",
    ready: "Ready to record",
    recording: "Recording...",
    stopped: "Recording stopped",
    uploading: "Uploading...",
    done: "Completed",
    error: "An error occurred",
  };

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="text-sm font-medium">{map[status]}</div>

      {status === "uploading" && (
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">{progress}%</p>
        </div>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}