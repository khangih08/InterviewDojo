import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecordingStatus from "@/components/interview/RecordingStatus";

describe("RecordingStatus", () => {
  it("renders idle helper text", () => {
    render(<RecordingStatus status="idle" />);

    expect(screen.getByText("Recording status")).toBeInTheDocument();
    expect(screen.getByText("Chưa sẵn sàng")).toBeInTheDocument();
    expect(
      screen.getByText(/Bật camera, ghi lại câu trả lời/i),
    ).toBeInTheDocument();
  });

  it("renders recording details with countdown and mic level", () => {
    render(
      <RecordingStatus
        status="recording"
        remainingSec={59}
        elapsedSec={61}
        maxDurationSec={120}
        recordingProgressPercent={50}
        volumeLevel={80}
      />,
    );

    expect(screen.getByText("Đang ghi âm")).toBeInTheDocument();
    expect(screen.getByText("00:59")).toBeInTheDocument();
    expect(screen.getByText(/Elapsed/)).toBeInTheDocument();
    expect(screen.getByText(/Max/)).toBeInTheDocument();
    expect(screen.getByText("Mic level")).toBeInTheDocument();
  });

  it("renders uploading progress", () => {
    render(<RecordingStatus status="uploading" progress={65} />);

    expect(screen.getByText("Đang tải lên")).toBeInTheDocument();
    expect(screen.getByText("Uploading video")).toBeInTheDocument();
    expect(screen.getByText(/65/)).toBeInTheDocument();
  });

  it("renders done state message", () => {
    render(<RecordingStatus status="done" />);

    expect(screen.getByText("Hoàn tất")).toBeInTheDocument();
    expect(
      screen.getByText(/Video đã sẵn sàng để xem kết quả/i),
    ).toBeInTheDocument();
  });

  it("renders error state message", () => {
    render(<RecordingStatus status="error" error="Upload failed" />);

    expect(screen.getByText("Có lỗi xảy ra")).toBeInTheDocument();
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });

  it("renders non-error warnings below normal states", () => {
    render(<RecordingStatus status="ready" error="Mic disconnected" />);

    expect(screen.getByText("Sẵn sàng ghi")).toBeInTheDocument();
    expect(screen.getByText("Mic disconnected")).toBeInTheDocument();
  });
});
