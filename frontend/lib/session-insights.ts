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

const CATEGORY_RULES: Array<{
  category: SessionCategory;
  keywords: string[];
}> = [
  {
    category: "Frontend",
    keywords: ["react", "css", "frontend", "browser", "dom", "ui", "ux"],
  },
  {
    category: "Backend",
    keywords: ["api", "backend", "database", "sql", "microservice", "server"],
  },
  {
    category: "System Design",
    keywords: ["scale", "system design", "architecture", "distributed", "cache"],
  },
  {
    category: "Algorithms",
    keywords: ["algorithm", "complexity", "tree", "graph", "array", "dp"],
  },
  {
    category: "Behavioral",
    keywords: ["yourself", "conflict", "challenge", "leadership", "team"],
  },
  {
    category: "Data",
    keywords: ["machine learning", "data", "model", "experiment", "analytics"],
  },
  {
    category: "DevOps",
    keywords: ["docker", "kubernetes", "ci/cd", "deployment", "monitoring"],
  },
  {
    category: "Mobile",
    keywords: ["android", "ios", "mobile", "swift", "kotlin", "react native"],
  },
  {
    category: "Security",
    keywords: ["security", "auth", "oauth", "jwt", "vulnerability", "xss"],
  },
];

export function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getAverageScore(session: Session) {
  if (!session.ai_analysis) return 0;

  const technical = clampScore(session.ai_analysis.technical_score ?? 0);
  const communication = clampScore(
    session.ai_analysis.communication_score ?? 0,
  );

  return Math.round((technical + communication) / 2);
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
