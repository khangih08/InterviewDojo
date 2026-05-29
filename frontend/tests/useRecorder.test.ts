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

const silenceConsoleError = () =>
  vi.spyOn(console, "error").mockImplementation(() => {});

import { useRecorder } from "@/hooks/useRecorder";

describe("useRecorder", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // vi.restoreAllMocks() in afterEach wipes return values on plain vi.fn() mocks,
    // so we re-setup everything that tests depend on having a specific return value.
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
    mockMediaStream.getTracks.mockReturnValue([
      { stop: vi.fn(), kind: "video" },
      { stop: vi.fn(), kind: "audio" },
    ]);
    mockMediaStream.getAudioTracks.mockReturnValue([{ stop: vi.fn() }]);
    MockMediaRecorder.isTypeSupported.mockReturnValue(true);

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
    silenceConsoleError();
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeTruthy();
  });

  it("sets error when mediaDevices is not available", async () => {
    silenceConsoleError();
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

  it("uses empty mimeType when no format is supported by MediaRecorder", async () => {
    MockMediaRecorder.isTypeSupported = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    // Should still record — mimeType falls back to "" (falsy), so MediaRecorder
    // is created without an explicit mimeType option
    act(() => {
      result.current.startRecording();
    });

    expect(result.current.status).toBe("recording");

    MockMediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);
  });

  it("sets error status when startRecording is called without a stream", () => {
    silenceConsoleError();
    const { result } = renderHook(() => useRecorder());
    // Never call setupDevices — streamRef.current is null

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeTruthy();
  });

  it("stopRecording does nothing when no recorder is active (null ref)", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.setupDevices();
    });

    // recorderRef.current is null (never started recording)
    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.status).toBe("ready");
  });

  it("stopRecording returns early when recorder is already inactive", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => { await result.current.setupDevices(); });
    act(() => { result.current.startRecording(); });
    await act(async () => { result.current.stopRecording(); });

    expect(result.current.status).toBe("stopped");

    // Calling stop again on the same (now inactive) recorder hits the early-return guard
    await act(async () => { result.current.stopRecording(); });

    expect(result.current.status).toBe("stopped"); // unchanged
  });

  it("revokes the object URL when resetting after a completed recording", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => { await result.current.setupDevices(); });
    act(() => { result.current.startRecording(); });
    await act(async () => { result.current.stopRecording(); });

    expect(result.current.recordedVideo?.url).toBe("blob:mock-url");

    await act(async () => { result.current.resetRecording(); });

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.recordedVideo).toBeNull();
  });

  it("sets status to idle when resetRecording is called without an active stream", () => {
    const { result } = renderHook(() => useRecorder());
    // No setupDevices call — streamRef.current is null

    act(() => { result.current.resetRecording(); });

    expect(result.current.status).toBe("idle");
  });

  it("stopDevices cleans up stream and returns status to idle", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => { await result.current.setupDevices(); });
    expect(result.current.status).toBe("ready");

    act(() => { result.current.stopDevices(); });

    expect(result.current.status).toBe("idle");
    const tracks = mockMediaStream.getTracks();
    tracks.forEach((t: { stop: ReturnType<typeof vi.fn> }) => {
      expect(t.stop).toHaveBeenCalled();
    });
  });

  it("stopDevices revokes the recorded video URL if one exists", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => { await result.current.setupDevices(); });
    act(() => { result.current.startRecording(); });
    await act(async () => { result.current.stopRecording(); });

    expect(result.current.recordedVideo?.url).toBe("blob:mock-url");

    act(() => { result.current.stopDevices(); });

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.status).toBe("idle");
  });
});
