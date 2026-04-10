import { http, toApiError } from "@/lib/api/http";
import type { AnalysisResponse } from "@/lib/api/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_ANALYSIS === "true";

const MOCK_ANALYSIS: AnalysisResponse = {
  sessionId: "mock-session-123",
  status: "done",
  transcript: "Lorem ipsum dolor sit amet...",
  technicalScore: 78,
  communicationScore: 82,
  strengths: ["Clear explanation", "Good problem solving"],
  weaknesses: ["Spoke too fast"],
  suggestions: ["Practice more"],
  metrics: [
    { label: "Technical", score: 78 },
    { label: "Communication", score: 82 },
    { label: "Depth", score: 75 },
    { label: "Clarity", score: 80 },
    { label: "Balance", score: 80 },
  ],
};

export async function getAnalysis(
  sessionId: string,
): Promise<AnalysisResponse> {
  if (USE_MOCK) {
    console.log("ℹ️  Using MOCK data for sessionId:", sessionId);
    return MOCK_ANALYSIS;
  }

  const url = "/analysis/" + encodeURIComponent(sessionId);
  console.log("🚀 getAnalysis:", { sessionId, url });

  try {
    const response = await http.get<AnalysisResponse>(url);
    console.log("✅ Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API error:", error);
    throw new Error(toApiError(error).message);
  }
}
