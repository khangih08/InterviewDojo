export type ToastKind = "error" | "success" | "info";

export type AppToastDetail = {
  kind: ToastKind;
  message: string;
};

export const APP_TOAST_EVENT = "idc:toast";

export function emitToast(detail: AppToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AppToastDetail>(APP_TOAST_EVENT, { detail }));
}

export function toastError(message: string) {
  emitToast({ kind: "error", message });
}

export function toastSuccess(message: string) {
  emitToast({ kind: "success", message });
}

export function toastInfo(message: string) {
  emitToast({ kind: "info", message });
}
