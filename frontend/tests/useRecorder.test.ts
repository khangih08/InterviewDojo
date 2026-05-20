import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true);
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  state = "inactive";
  stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  start = vi.fn(() => {
    this.state = "recording";
  });

  stop = vi.fn(() => {
    this.state = "inactive";
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(["audio"], { type: "audio/webm" }) });
    }
    if (this.onstop) this.onstop();
  });

  pause = vi.fn();
  resume = vi.fn();
}

const mockGetUserMedia = vi.fn();
const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
const mockRevokeObjectURL = vi.fn();

// Mock AudioContext
class MockAnalyserNode {
  fftSize = 256;
  frequencyBinCount = 128;
  getByteFrequencyData = vi.fn();
  disconnect = vi.fn();
}

class MockAudioContext {
  state = "running";
  createAnalyser = vi.fn().mockReturnValue(new MockAnalyserNode());
  createMediaStreamSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
  });
  close = vi.fn().mockResolvedValue(undefined);
}

Object.defineProperty(global, "MediaRecorder", {
  writable: true,
  configurable: true,
  value: MockMediaRecorder,
});

Object.defineProperty(global.URL, "createObjectURL", {
  writable: true,
  configurable: true,
  value: mockCreateObjectURL,
});

Object.defineProperty(global.URL, "revokeObjectURL", {
  writable: true,
  configurable: true,
  value: mockRevokeObjectURL,
});

Object.defineProperty(global, "AudioContext", {
  writable: true,
  configurable: true,
  value: MockAudioContext,
});

const mockMediaStream = {
  getTracks: vi.fn().mockReturnValue([
    { stop: vi.fn(), kind: "video" },
    { stop: vi.fn(), kind: "audio" },
  ]),
  getAudioTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
};

import { useRecorder } from "@/hooks/useRecorder";

describe("useRecorder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      configurable: true,
      value: { getUserMedia: mockGetUserMedia },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with idle status", () => {
    const { result } = renderHook(() => useRecorder());
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBe("");
    expect(result.current.recordedVideo).toBeNull();
  });

  it("transitions to ready status after setupDevices", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    expect(result.current.status).toBe("ready");
    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ audio: true }),
    );
  });

  it("transitions to recording status after startRecording", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.status).toBe("recording");
  });

  it("transitions to stopped status after stopRecording", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    act(() => {
      result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    expect(result.current.status).toBe("stopped");
  });

  it("sets error status when getUserMedia fails", async () => {
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeTruthy();
  });

  it("sets error when mediaDevices is not available", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    expect(result.current.status).toBe("error");
  });

  it("resets to ready status after resetRecording", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    act(() => {
      result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    await act(async () => {
      await result.current.resetRecording();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.recordedVideo).toBeNull();
  });

  it("records elapsed time during recording", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    act(() => {
      result.current.startRecording();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedSec).toBeGreaterThanOrEqual(0);

    vi.useRealTimers();
  });
});
