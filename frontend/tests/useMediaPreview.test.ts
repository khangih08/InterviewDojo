import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useMediaPreview } from "@/hooks/useMediaPreview";

const mockGetUserMedia = vi.fn();

// Plain function (not vi.fn) so vi.clearAllMocks() can't wipe the return value
// and React's passive effect cleanup can always call it safely.
let mockTrack: { stop: ReturnType<typeof vi.fn> };
let mockStream: { getTracks: () => typeof mockTrack[] };

describe("useMediaPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrack = { stop: vi.fn() };
    mockStream = { getTracks: () => [mockTrack] };
    mockGetUserMedia.mockResolvedValue(mockStream as unknown as MediaStream);
    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      configurable: true,
      value: { getUserMedia: mockGetUserMedia },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with no stream, no error, and disabled", () => {
    const { result } = renderHook(() => useMediaPreview());
    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.enabled).toBe(false);
    expect(result.current.videoRef).toBeDefined();
  });

  it("start() calls getUserMedia with video and audio constraints", async () => {
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
  });

  it("start() sets stream and enabled=true on success", async () => {
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.stream).toBe(mockStream);
    expect(result.current.enabled).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("start() sets error message when getUserMedia fails", async () => {
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.stream).toBeNull();
    expect(result.current.enabled).toBe(false);
  });

  it("start() stops existing stream tracks before acquiring a new one", async () => {
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    const secondTrack = { stop: vi.fn() };
    const secondStream = { getTracks: () => [secondTrack] };
    mockGetUserMedia.mockResolvedValue(secondStream as unknown as MediaStream);

    await act(async () => {
      await result.current.start();
    });

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it("stop() clears stream and sets enabled=false", async () => {
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.enabled).toBe(false);
  });

  it("stop() stops all tracks in the stream", async () => {
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it("cleans up stream tracks on unmount", async () => {
    const { result, unmount } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    unmount();

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it("clears error when start() is called again after a failure", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));
    const { result } = renderHook(() => useMediaPreview());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeTruthy();

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.enabled).toBe(true);
  });
});
