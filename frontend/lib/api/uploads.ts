import axios from "axios";
import { http, toApiError } from "@/lib/api/http";
import type {
  PresignUploadRequest,
  PresignUploadResponse,
} from "@/lib/api/types";

export async function getPresignedUploadUrl(
  payload: PresignUploadRequest
): Promise<PresignUploadResponse> {
  try {
    const response = await http.post<PresignUploadResponse>(
      "/uploads/presign",
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}

export async function uploadFileToS3(params: {
  uploadUrl: string;
  file: Blob;
  contentType: string;
  headers?: Record<string, string>;
  onProgress?: (percent: number) => void;
}) {
  const { uploadUrl, file, contentType, headers, onProgress } = params;

  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": contentType,
      ...(headers ?? {}),
    },
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total) return;
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress?.(percent);
    },
  });
}