import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobRole } from "@/lib/api/types";

export type RoleGuide = {
  planName: string;
  planLength: string;
  planSummary: string;
  focusTopics: string[];
  mockType: string;
  nextAction: string;
};

export const roleDashboard: Record<JobRole, RoleGuide> = {
  "Backend Developer": {
    planName: "Backend Interview Track",
    planLength: "2 weeks",
    planSummary: "API design, DB modeling, scaling, and reliability.",
    focusTopics: ["System Design", "Database", "API"],
    mockType: "Backend mock",
    nextAction: "Practice trade-offs in API and database design.",
  },
  "Frontend Developer": {
    planName: "Frontend Interview Track",
    planLength: "2 weeks",
    planSummary: "React, JS, performance, UI tradeoffs.",
    focusTopics: ["React", "JS", "Performance"],
    mockType: "Frontend mock",
    nextAction: "Focus on React + browser questions.",
  },
  "Fullstack Developer": {
    planName: "Fullstack Interview Track",
    planLength: "3 weeks",
    planSummary: "End-to-end features and architecture.",
    focusTopics: ["Frontend", "Backend", "Architecture"],
    mockType: "Fullstack mock",
    nextAction: "Practice explaining end-to-end implementation decisions.",
  },
  "AI Engineer": {
    planName: "AI Engineer Track",
    planLength: "3 weeks",
    planSummary: "LLM integration, evaluation, and MLOps.",
    focusTopics: ["LLM", "Evaluation", "MLOps"],
    mockType: "AI mock",
    nextAction: "Prepare model selection and evaluation strategy answers.",
  },
  "DevOps Engineer": {
    planName: "DevOps Interview Track",
    planLength: "2 weeks",
    planSummary: "CI/CD, observability, infra as code.",
    focusTopics: ["CI/CD", "Kubernetes", "Monitoring"],
    mockType: "DevOps mock",
    nextAction: "Review deployment and incident handling scenarios.",
  },
  "Data Scientist": {
    planName: "Data Scientist Track",
    planLength: "3 weeks",
    planSummary: "Statistics, experimentation, and modeling.",
    focusTopics: ["Statistics", "Modeling", "A/B Testing"],
    mockType: "Data mock",
    nextAction: "Practice feature selection and metric justification.",
  },
  "Cloud Engineer": {
    planName: "Cloud Interview Track",
    planLength: "2 weeks",
    planSummary: "Cloud architecture, security, and cost trade-offs.",
    focusTopics: ["Architecture", "Security", "Cost"],
    mockType: "Cloud mock",
    nextAction: "Prepare high-availability and cost-optimization discussions.",
  },
  "Mobile Developer": {
    planName: "Mobile Interview Track",
    planLength: "2 weeks",
    planSummary: "App architecture, performance, platform best practices.",
    focusTopics: ["Architecture", "Performance", "UX"],
    mockType: "Mobile mock",
    nextAction: "Practice lifecycle and offline-first design questions.",
  },
  "Security Engineer": {
    planName: "Security Interview Track",
    planLength: "3 weeks",
    planSummary: "Threat modeling, AppSec, secure coding.",
    focusTopics: ["Threat Modeling", "AppSec", "Incident Response"],
    mockType: "Security mock",
    nextAction: "Focus on vulnerabilities and mitigation strategies.",
  },
  "Embedded Systems Engineer": {
    planName: "Embedded Interview Track",
    planLength: "3 weeks",
    planSummary: "C/C++, firmware, real-time constraints.",
    focusTopics: ["C/C++", "RTOS", "Debugging"],
    mockType: "Embedded mock",
    nextAction: "Practice timing, memory, and hardware interface questions.",
  },
};

type DashboardHeroProps = {
  name: string;
  guide: RoleGuide;
  totalSessions: number;
  avgScore: number;
};

export function DashboardHero({
  name,
  guide,
  totalSessions,
  avgScore,
}: DashboardHeroProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-lg sm:p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-200">
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Welcome back, {name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/90 sm:text-base">
            Your current track is {guide.planName} ({guide.planLength}). Keep
            momentum by practicing focused sessions and reviewing feedback after
            each round.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-white text-violet-700 hover:bg-violet-50"
            >
              <Link href="/questions" className="flex items-center gap-2">
                Practice now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-violet-50">
              {guide.mockType}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
