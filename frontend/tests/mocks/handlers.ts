import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8000";

const mockUser = {
  id: "u-1",
  email: "test@example.com",
  full_name: "Test User",
  target_role: "Frontend Developer",
  experience_level: "junior",
  role: "user",
};

const mockAuthResponse = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  token: "mock-access-token",
  user: mockUser,
};

const mockSession = {
  id: "s-1",
  device_name: "Chrome on Windows",
  user_agent: "Mozilla/5.0",
  ip_address: "127.0.0.1",
  created_at: "2026-01-01T00:00:00.000Z",
  last_accessed_at: "2026-01-01T00:00:00.000Z",
  expires_at: "2026-02-01T00:00:00.000Z",
  is_active: true,
};

const mockQuestion = {
  id: "q-1",
  content: "What is a closure?",
  category: { id: "c-1", name: "JavaScript" },
  difficulty: "medium",
  tags: [{ id: "t-1", name: "JavaScript" }],
  durationSeconds: 120,
};

const mockAnalysis = {
  sessionId: "sess-1",
  status: "done",
  transcript: "Sample transcript",
  technicalScore: 80,
  communicationScore: 75,
  strengths: ["Clear explanation"],
  weaknesses: ["Missing edge cases"],
  suggestions: ["Practice more"],
  metrics: [{ label: "Clarity", score: 80 }],
  summary: "Good performance overall.",
};

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, () => HttpResponse.json(mockAuthResponse)),
  http.post(`${BASE}/auth/refresh`, () => HttpResponse.json(mockAuthResponse)),
  http.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 200 })),
  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({ message: "Registration successful" }),
  ),
  http.post(`${BASE}/auth/google/login`, () =>
    HttpResponse.json(mockAuthResponse),
  ),
  http.post(`${BASE}/auth/google/register`, () =>
    HttpResponse.json({
      message: "Verification code sent",
      email: "test@example.com",
      full_name: "Test User",
    }),
  ),
  http.post(`${BASE}/auth/google/register/verify`, () =>
    HttpResponse.json(mockAuthResponse),
  ),
  http.post(`${BASE}/auth/google/complete-profile`, () =>
    HttpResponse.json({ message: "Profile completed", user: mockUser }),
  ),
  http.post(`${BASE}/auth/forgot-password`, () =>
    HttpResponse.json({ message: "Reset code sent" }),
  ),
  http.post(`${BASE}/auth/forgot-password/verify`, () =>
    HttpResponse.json({ message: "Code verified" }),
  ),
  http.post(`${BASE}/auth/forgot-password/reset`, () =>
    HttpResponse.json({ message: "Password reset successful" }),
  ),

  // Sessions (auth device sessions)
  http.get(`${BASE}/sessions`, () => HttpResponse.json([mockSession])),
  http.get(`${BASE}/sessions/:id`, () => HttpResponse.json(mockSession)),
  http.delete(`${BASE}/sessions/:id`, () =>
    new HttpResponse(null, { status: 200 }),
  ),
  http.delete(`${BASE}/sessions/revoke/all-other`, () =>
    new HttpResponse(null, { status: 200 }),
  ),
  http.delete(`${BASE}/sessions`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  // Interview sessions
  http.post(`${BASE}/sessions`, () =>
    HttpResponse.json({ session_id: "sess-1" }),
  ),
  http.post(`${BASE}/session/complete`, () =>
    HttpResponse.json({ success: true }),
  ),

  // Questions
  http.get(`${BASE}/questions`, () =>
    HttpResponse.json({ items: [mockQuestion], total: 1, page: 1, limit: 10 }),
  ),
  http.get(`${BASE}/questions/:id`, () => HttpResponse.json(mockQuestion)),
  http.get(`${BASE}/categories`, () =>
    HttpResponse.json([{ id: "c-1", name: "JavaScript" }]),
  ),
  http.get(`${BASE}/tags`, () =>
    HttpResponse.json([{ id: "t-1", name: "JavaScript" }]),
  ),

  // Analysis
  http.get(`${BASE}/analysis/:sessionId`, () =>
    HttpResponse.json(mockAnalysis),
  ),

  // Uploads
  http.post(`${BASE}/uploads/presign`, () =>
    HttpResponse.json({
      upload_url: "https://s3.example.com/upload",
      file_url: "https://s3.example.com/file.webm",
    }),
  ),
];
