import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPost, mockPut } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    put: mockPut,
  },
}));

vi.mock("@/lib/api/http", () => ({
  http: {
    post: mockPost,
  },
  toApiError: vi.fn((error: unknown) => ({
    message: error instanceof Error ? error.message : "unknown",
  })),
}));

import { getPresignedUploadUrl, uploadFileToS3 } from "@/lib/api/uploads";

describe("uploads api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets a presigned upload url", async () => {
    const payload = {
      session_id: "s-1",
      file_name: "answer.webm",
      content_type: "video/webm",
      size_bytes: 2048,
    };
    mockPost.mockResolvedValue({
      data: {
        upload_url: "https://upload.example.com",
        file_url: "https://cdn.example.com/file.webm",
      },
    });

    await expect(getPresignedUploadUrl(payload)).resolves.toEqual({
      upload_url: "https://upload.example.com",
      file_url: "https://cdn.example.com/file.webm",
    });
    expect(mockPost).toHaveBeenCalledWith("/uploads/presign", payload);
  });

  it("uploads file to S3 and reports progress", async () => {
    const onProgress = vi.fn();
    mockPut.mockImplementation(async (_url: string, _file: Blob, config: any) => {
      config.onUploadProgress({ loaded: 50, total: 100 });
      config.onUploadProgress({ loaded: 100, total: 100 });
    });

    await uploadFileToS3({
      uploadUrl: "https://upload.example.com",
      file: new Blob(["video"]),
      contentType: "video/webm",
      headers: { "x-extra": "1" },
      onProgress,
    });

    expect(mockPut).toHaveBeenCalledWith(
      "https://upload.example.com",
      expect.any(Blob),
      expect.objectContaining({
        headers: {
          "Content-Type": "video/webm",
          "x-extra": "1",
        },
        onUploadProgress: expect.any(Function),
      }),
    );
    expect(onProgress).toHaveBeenNthCalledWith(1, 50);
    expect(onProgress).toHaveBeenNthCalledWith(2, 100);
  });

  it("ignores progress events without total bytes", async () => {
    const onProgress = vi.fn();
    mockPut.mockImplementation(async (_url: string, _file: Blob, config: any) => {
      config.onUploadProgress({ loaded: 1, total: 0 });
    });

    await uploadFileToS3({
      uploadUrl: "https://upload.example.com",
      file: new Blob(["video"]),
      contentType: "video/webm",
      onProgress,
    });

    expect(onProgress).not.toHaveBeenCalled();
  });
});
