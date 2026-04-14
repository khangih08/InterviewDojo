"use client";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function CircularTimer({
  secondsLeft,
  total,
}: {
  secondsLeft: number;
  total: number;
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, secondsLeft / total));
  const dash = pct * c;
  const colour = pct > 0.5 ? "#6366f1" : pct > 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={128} height={128} className="-rotate-90">
        <circle
          cx={64}
          cy={64}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
        />
        <circle
          cx={64}
          cy={64}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s" }}
        />
      </svg>
      <span
        className="absolute text-3xl font-semibold tabular-nums tracking-widest text-white"
        style={{ textShadow: `0 0 20px ${colour}88` }}
      >
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}
