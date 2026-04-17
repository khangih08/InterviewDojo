"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { APP_TOAST_EVENT, type AppToastDetail } from "@/lib/toast";

type ToastItem = AppToastDetail & {
  id: number;
};

const BASE_STYLES =
  "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur transition";

const KIND_STYLES: Record<AppToastDetail["kind"], string> = {
  error: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

const IconByKind = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function GlobalToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let sequence = 0;

    const onToast = (event: Event) => {
      const customEvent = event as CustomEvent<AppToastDetail>;
      const detail = customEvent.detail;
      if (!detail?.message) return;

      const id = ++sequence;
      setToasts((prev) => [...prev, { ...detail, id }]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener(APP_TOAST_EVENT, onToast as EventListener);

    return () => {
      window.removeEventListener(APP_TOAST_EVENT, onToast as EventListener);
    };
  }, []);

  const visibleToasts = useMemo(() => toasts.slice(-4), [toasts]);

  if (!visibleToasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-[min(92vw,420px)] flex-col gap-3">
      {visibleToasts.map((toast) => {
        const Icon = IconByKind[toast.kind];
        return (
          <div key={toast.id} className={`${BASE_STYLES} ${KIND_STYLES[toast.kind]}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              className="rounded p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
