import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const setupDevices = vi.fn();
const startRecording = vi.fn();
const stopRecording = vi.fn();
const resetRecording = vi.fn();
const stopDevices = vi.fn();

const useRecorderMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/hooks/useRecorder", () => ({
  useRecorder: () => useRecorderMock(),
}));

vi.mock("@/components/interview/CircularTimer", () => ({
  default: ({ secondsLeft }: { secondsLeft: number }) => (
    <div>Timer {secondsLeft}</div>
  ),
}));

const question = {
  id: "q-1",
  content: "Tell me about indexing",
  sampleAnswer: "Use indexes for selective queries",
  difficultyLevel: 3,
  categoryId: "backend",
  categoryName: "Backend",
  tags: ["sql"],
  createdAt: "2026-04-22T00:00:00.000Z",
};

import RecorderPanel from "@/components/interview/RecorderPanel";

describe("RecorderPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDevices.mockResolvedValue(true);
    startRecording.mockReturnValue(true);
    stopRecording.mockReturnValue(true);

    useRecorderMock.mockReturnValue({
      status: "idle",
      error: "",
      recordedVideo: null,
      previewVideoRef: { current: null },
      elapsedSec: 0,
      remainingSec: 120,
      maxDurationSec: 120,
      recordingProgressPercent: 0,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("confirm", vi.fn(() => true));

    const storage = new Map<string, string>();
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
    });
  });

  it("renders the enable devices action in idle state", () => {
    render(<RecorderPanel question={question} />);

    expect(
      screen.getByRole("button", { name: /Sẵn sàng \(Bật Camera\)/i }),
    ).toBeInTheDocument();
  });

  it("moves to ready state when devices are enabled", async () => {
    render(<RecorderPanel question={question} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Sẵn sàng \(Bật Camera\)/i }),
    );

    await waitFor(() => {
      expect(setupDevices).toHaveBeenCalled();
    });
  });

  it("starts recording from the ready state", () => {
    useRecorderMock.mockReturnValue({
      status: "ready",
      error: "",
      recordedVideo: null,
      previewVideoRef: { current: null },
      elapsedSec: 0,
      remainingSec: 120,
      maxDurationSec: 120,
      recordingProgressPercent: 0,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Bắt đầu ghi hình/i));

    expect(startRecording).toHaveBeenCalled();
  });

  it("stops recording from the recording state", () => {
    useRecorderMock.mockReturnValue({
      status: "recording",
      error: "",
      recordedVideo: null,
      previewVideoRef: { current: null },
      elapsedSec: 40,
      remainingSec: 80,
      maxDurationSec: 120,
      recordingProgressPercent: 33,
      volumeLevel: 60,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Kết thúc ghi hình/i));

    expect(stopRecording).toHaveBeenCalled();
    expect(screen.getByText("Timer 80")).toBeInTheDocument();
  });

  it("shows recorded video and can retry from stopped state", () => {
    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: {
        url: "blob:video",
        sizeBytes: 1024 * 1024,
        mimeType: "video/webm",
        blob: new Blob(["video"]),
      },
      previewVideoRef: { current: null },
      elapsedSec: 120,
      remainingSec: 0,
      maxDurationSec: 120,
      recordingProgressPercent: 100,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);

    expect(screen.getByText(/Video da quay/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Ghi hình lại/i));

    expect(resetRecording).toHaveBeenCalled();
    expect(startRecording).toHaveBeenCalled();
  });

  it("shows an error when uploading without a recorded video", async () => {
    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: null,
      previewVideoRef: { current: null },
      elapsedSec: 120,
      remainingSec: 0,
      maxDurationSec: 120,
      recordingProgressPercent: 100,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Nộp câu trả lời/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Vui lòng ghi hình câu trả lời trước khi tải lên/i),
      ).toBeInTheDocument();
    });
  });

  it("uploads a recorded answer successfully", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        transcript: "I used indexes to optimize queries",
        feedback: "Good explanation",
      }),
    } as Response);

    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: {
        url: "blob:video",
        sizeBytes: 1024 * 1024,
        mimeType: "video/webm",
        blob: new Blob(["video"]),
      },
      previewVideoRef: { current: null },
      elapsedSec: 120,
      remainingSec: 0,
      maxDurationSec: 120,
      recordingProgressPercent: 100,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Nộp câu trả lời/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith(expect.stringContaining("/result?sessionId="));
    });
  });

  it("shows error when question is null during upload", async () => {
    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: {
        url: "blob:video",
        sizeBytes: 512,
        mimeType: "video/webm",
        blob: new Blob(["video"]),
      },
      previewVideoRef: { current: null },
      elapsedSec: 10,
      remainingSec: 110,
      maxDurationSec: 120,
      recordingProgressPercent: 8,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={null} />);
    fireEvent.click(screen.getByText(/Nộp câu trả lời/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Lỗi: Không tìm thấy dữ liệu câu hỏi/i),
      ).toBeInTheDocument();
    });
  });

  it("cancels upload when user declines the confirm dialog", async () => {
    vi.stubGlobal("confirm", vi.fn(() => false));

    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: {
        url: "blob:video",
        sizeBytes: 512,
        mimeType: "video/webm",
        blob: new Blob(["video"]),
      },
      previewVideoRef: { current: null },
      elapsedSec: 10,
      remainingSec: 110,
      maxDurationSec: 120,
      recordingProgressPercent: 8,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Nộp câu trả lời/i));

    // fetch should never be called if the user cancelled
    await new Promise((r) => setTimeout(r, 50));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows error when server returns a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as Response);

    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: {
        url: "blob:video",
        sizeBytes: 512,
        mimeType: "video/webm",
        blob: new Blob(["video"]),
      },
      previewVideoRef: { current: null },
      elapsedSec: 10,
      remainingSec: 110,
      maxDurationSec: 120,
      recordingProgressPercent: 8,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Nộp câu trả lời/i));

    await waitFor(() => {
      expect(screen.getByText(/Upload fail/i)).toBeInTheDocument();
    });
  });

  it("shows error when backend returns success:false", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    } as Response);

    useRecorderMock.mockReturnValue({
      status: "stopped",
      error: "",
      recordedVideo: {
        url: "blob:video",
        sizeBytes: 512,
        mimeType: "video/webm",
        blob: new Blob(["video"]),
      },
      previewVideoRef: { current: null },
      elapsedSec: 10,
      remainingSec: 110,
      maxDurationSec: 120,
      recordingProgressPercent: 8,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Nộp câu trả lời/i));

    await waitFor(() => {
      expect(screen.getByText(/Upload fail/i)).toBeInTheDocument();
    });
  });

  it("shows error state when device setup fails", async () => {
    setupDevices.mockResolvedValue(false);

    render(<RecorderPanel question={question} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Sẵn sàng \(Bật Camera\)/i }),
    );

    await waitFor(() => {
      expect(setupDevices).toHaveBeenCalled();
    });
  });

  it("shows error state when startRecording returns false", () => {
    startRecording.mockReturnValue(false);

    useRecorderMock.mockReturnValue({
      status: "ready",
      error: "",
      recordedVideo: null,
      previewVideoRef: { current: null },
      elapsedSec: 0,
      remainingSec: 120,
      maxDurationSec: 120,
      recordingProgressPercent: 0,
      volumeLevel: 0,
      setupDevices,
      startRecording,
      stopRecording,
      resetRecording,
      stopDevices,
    });

    render(<RecorderPanel question={question} />);
    fireEvent.click(screen.getByText(/Bắt đầu ghi hình/i));

    expect(startRecording).toHaveBeenCalled();
  });
});
