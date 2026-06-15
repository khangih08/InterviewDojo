import type { Session } from "@/lib/api/types";

export type SessionCategory =
  | "Frontend"
  | "Backend"
  | "System Design"
  | "Algorithms"
  | "Behavioral"
  | "Data"
  | "DevOps"
  | "Mobile"
  | "Security"
  | "General";

// ĐÃ CẬP NHẬT: Bổ sung từ khóa Tiếng Việt và các biến thể viết tắt để AI mapping chuẩn 100%
const CATEGORY_RULES: Array<{
  category: SessionCategory;
  keywords: string[];
}> = [
  {
    category: "Frontend",
    keywords: ["react", "css", "frontend", "browser", "dom", "ui", "ux", "fe", "html", "javascript", "js", "giao diện", "vue", "nextjs", "angular", "tailwind"],
  },
  {
    category: "Backend",
    keywords: ["api", "backend", "database", "sql", "microservice", "server", "be", "node", "express", "nestjs", "cơ sở dữ liệu", "truy vấn", "mongodb", "postgres", "redis"],
  },
  {
    category: "System Design",
    keywords: ["scale", "system design", "architecture", "distributed", "cache", "thiết kế hệ thống", "kiến trúc", "phân tán", "tải cao", "load balancer", "sharding", "microservices"],
  },
  {
    category: "Algorithms",
    keywords: ["algorithm", "complexity", "tree", "graph", "array", "dp", "thuật toán", "độ phức tạp", "cây", "đồ thị", "mảng", "chuỗi", "đệ quy", "sắp xếp", "tìm kiếm", "leetcode", "tối ưu"],
  },
  {
    category: "Behavioral",
    keywords: ["yourself", "conflict", "challenge", "leadership", "team", "bản thân", "xung đột", "thách thức", "khó khăn", "tình huống", "đồng nghiệp", "quản lý", "dự án", "kinh nghiệm", "lãnh đạo", "giới thiệu"],
  },
  {
    category: "Data",
    keywords: ["machine learning", "data", "model", "experiment", "analytics", "dữ liệu", "mô hình", "phân tích", "trực quan", "ai", "báo cáo"],
  },
  {
    category: "DevOps",
    keywords: ["docker", "kubernetes", "ci/cd", "deployment", "monitoring", "triển khai", "vận hành", "k8s", "cloud", "aws", "cicd"],
  },
  {
    category: "Mobile",
    keywords: ["android", "ios", "mobile", "swift", "kotlin", "react native", "di động", "flutter", "app"],
  },
  {
    category: "Security",
    keywords: ["security", "auth", "oauth", "jwt", "vulnerability", "xss", "bảo mật", "mã hóa", "tấn công", "phân quyền", "đăng nhập"],
  },
];

export function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

// ĐÃ SỬA LỖI 0%: Thuật toán quét điểm đa tầng (Quét mọi ngóc ngách cấu trúc dữ liệu của Session)
export function getAverageScore(session: any) {
  if (!session) return 0;

  // 1. Tìm điểm số tổng quan trực tiếp từ các trường cấu trúc khác nhau
  const directScore = session.score ??
                      session.evaluation?.overallScore ??
                      session.evaluation?.score ??
                      session.ai_analysis?.score ??
                      session.ai_analysis?.overallScore ??
                      session.ai_analysis?.overall_score;

  if (directScore !== undefined && directScore !== null) {
    return clampScore(directScore);
  }

  // 2. Nếu không tìm thấy score tổng, tự động tính toán trung bình cộng từ sub-scores
  const analysis = session.ai_analysis || session.evaluation;
  if (analysis) {
    const technical = analysis.technical_score ?? analysis.technicalScore;
    const communication = analysis.communication_score ?? analysis.communicationScore;

    if (technical !== undefined || communication !== undefined) {
      const tScore = clampScore(technical ?? 0);
      const cScore = clampScore(communication ?? 0);
      return Math.round((tScore + cScore) / 2);
    }
  }

  return 0; // Trả về số mặc định nếu phiên chưa được chấm điểm hoặc FAILED
}

export function inferSessionCategory(
  questionContent?: string,
): SessionCategory {
  const normalized = questionContent?.toLowerCase() ?? "";

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.category;
    }
  }

  return "General";
}

export function getScoreTone(score: number) {
  if (score >= 85) {
    return {
      label: "Excellent",
      textClassName: "text-emerald-600",
      ringClassName: "ring-emerald-200",
      surfaceClassName: "bg-emerald-50",
    };
  }

  if (score >= 70) {
    return {
      label: "Strong",
      textClassName: "text-sky-600",
      ringClassName: "ring-sky-200",
      surfaceClassName: "bg-sky-50",
    };
  }

  if (score >= 55) {
    return {
      label: "Needs polish",
      textClassName: "text-amber-600",
      ringClassName: "ring-amber-200",
      surfaceClassName: "bg-amber-50",
    };
  }

  return {
    label: "Needs work",
    textClassName: "text-rose-600",
    ringClassName: "ring-rose-200",
    surfaceClassName: "bg-rose-50",
  };
}