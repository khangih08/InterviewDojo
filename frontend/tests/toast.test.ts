import { describe, it, expect, vi, afterEach } from "vitest";
import {
  emitToast,
  toastError,
  toastSuccess,
  toastInfo,
  APP_TOAST_EVENT,
} from "@/lib/toast";

describe("toast utilities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("dispatches a CustomEvent with the correct type and detail", () => {
    const spy = vi.spyOn(window, "dispatchEvent").mockReturnValue(true);
    emitToast({ kind: "info", message: "Hello" });

    expect(spy).toHaveBeenCalledOnce();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe(APP_TOAST_EVENT);
    expect(event.detail).toEqual({ kind: "info", message: "Hello" });
  });

  it("does nothing when window is undefined (SSR guard)", () => {
    vi.stubGlobal("window", undefined);
    expect(() => emitToast({ kind: "error", message: "test" })).not.toThrow();
  });

  it("toastError dispatches an error event", () => {
    const spy = vi.spyOn(window, "dispatchEvent").mockReturnValue(true);
    toastError("Something broke");

    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ kind: "error", message: "Something broke" });
  });

  it("toastSuccess dispatches a success event", () => {
    const spy = vi.spyOn(window, "dispatchEvent").mockReturnValue(true);
    toastSuccess("All good");

    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ kind: "success", message: "All good" });
  });

  it("toastInfo dispatches an info event", () => {
    const spy = vi.spyOn(window, "dispatchEvent").mockReturnValue(true);
    toastInfo("FYI");

    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ kind: "info", message: "FYI" });
  });
});
