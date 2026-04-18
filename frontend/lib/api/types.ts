export type User = {
  id?: string;
  email: string;
  full_name?: string;
  target_role?: JobRole;
  experience_level?: ExperienceLevel;
  role?: "admin" | "user";
};

export type JobRole =
  | "Backend Developer"
  | "Frontend Developer"
  | "Fullstack Developer"
  | "AI Engineer"
  | "DevOps Engineer"
  | "Data Scientist"
  | "Cloud Engineer"
  | "Mobile Developer"
  | "Security Engineer"
  | "Embedded Systems Engineer";

export type ExperienceLevel =
  | "intern"
  | "fresher"
  | "junior"
  | "middle"
  | "senior";

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthGoogleLoginRequest = {
  idToken: string;
};

export type AuthGoogleRegisterStartRequest = {
  idToken: string;
  target_role: JobRole;
  experience_level: ExperienceLevel;
};

export type AuthGoogleRegisterVerifyRequest = {
  email: string;
  code: string;
};

export type CompleteGoogleProfileRequest = {
  full_name: string;
  target_role: JobRole;
  experience_level: ExperienceLevel;
};

export type CompleteGoogleProfileResponse = {
  message: string;
  user: User;
};

export type AuthGoogleRegisterStartResponse = {
  message: string;
  email: string;
  full_name: string;
};

export type AuthRegisterRequest = {
  email: string;
  password: string;
  full_name: string;
  target_role: JobRole;
  experience_level: ExperienceLevel;
};

export type AuthForgotPasswordRequest = {
  email: string;
};

export type AuthForgotPasswordVerifyRequest = {
  email: string;
  code: string;
};

export type AuthForgotPasswordResetRequest = {
  email: string;
  code: string;
  password: string;
};

export type AuthForgotPasswordResponse = {
  message: string;
};

export type AuthLoginResponse = {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: User;
  requiresProfileCompletion?: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  id: string;
  content: string;
  category: Category;
  difficulty: Difficulty;
  tags: Tag[];
  durationSeconds?: number;
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type GetQuestionsParams = {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  difficulty?: Difficulty | "";
  tagId?: string;
};

export type CreateSessionRequest = {
  question_id: string;
};

export type CreateSessionResponse = {
  session_id: string;
};

export type PresignUploadRequest = {
  session_id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
};

export type PresignUploadResponse = {
  upload_url: string;
  file_url: string;
  object_key?: string;
  method?: "PUT" | "POST";
  headers?: Record<string, string>;
};

export type CompleteSessionRequest = {
  session_id: string;
  recording_url: string;
  duration_seconds: number;
  size_bytes: number;
  mime_type: string;
};

export type CompleteSessionResponse = {
  success: boolean;
  message?: string;
};

export type AnalysisStatus = "processing" | "done" | "error";

export type AnalysisMetric = {
  label: string;
  score: number;
};

export type AnalysisResponse = {
  sessionId: string;
  status: AnalysisStatus;
  transcript?: string;
  technicalScore?: number;
  communicationScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  metrics?: AnalysisMetric[];
  summary?: string;
  message?: string;
};

export type SessionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type SessionAiAnalysis = {
  technical_score?: number;
  communication_score?: number;
  feedback?: string;
  transcript?: string;
};

export type Session = {
  id: string;
  created_at: string;
  status: SessionStatus;
  question_content?: string;
  ai_analysis?: SessionAiAnalysis | null;
};

// User/Auth Sessions
export type UserSession = {
  id: string;
  device_name: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_accessed_at: string;
  expires_at: string | null;
  is_active: boolean;
};
