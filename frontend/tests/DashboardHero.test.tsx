import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

import React from "react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import type { RoleGuide } from "@/components/dashboard/DashboardHero";

const mockGuide: RoleGuide = {
  planName: "Backend Interview Track",
  planLength: "2 weeks",
  planSummary: "API design, DB modeling, scaling, and reliability.",
  focusTopics: ["System Design", "Database", "API"],
  mockType: "Backend mock",
  nextAction: "Practice trade-offs in API and database design.",
};

describe("DashboardHero", () => {
  it("displays the user name in the welcome message", () => {
    render(
      <DashboardHero name="Huy" guide={mockGuide} totalSessions={5} avgScore={80} />,
    );

    expect(screen.getByText(/Welcome back, Huy/i)).toBeInTheDocument();
  });

  it("displays the plan name and duration from the guide", () => {
    render(
      <DashboardHero name="Huy" guide={mockGuide} totalSessions={5} avgScore={80} />,
    );

    expect(screen.getByText(/Backend Interview Track/)).toBeInTheDocument();
    expect(screen.getByText(/2 weeks/)).toBeInTheDocument();
  });

  it("displays the mock type badge", () => {
    render(
      <DashboardHero name="Huy" guide={mockGuide} totalSessions={5} avgScore={80} />,
    );

    expect(screen.getByText("Backend mock")).toBeInTheDocument();
  });

  it("renders the Practice now link pointing to /questions", () => {
    render(
      <DashboardHero name="Huy" guide={mockGuide} totalSessions={5} avgScore={80} />,
    );

    const link = screen.getByRole("link", { name: /Practice now/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/questions");
  });

  it("renders correctly for a different role guide", () => {
    const frontendGuide: RoleGuide = {
      planName: "Frontend Interview Track",
      planLength: "2 weeks",
      planSummary: "React, JS, performance, UI tradeoffs.",
      focusTopics: ["React", "JS", "Performance"],
      mockType: "Frontend mock",
      nextAction: "Focus on React + browser questions.",
    };

    render(
      <DashboardHero name="An" guide={frontendGuide} totalSessions={0} avgScore={0} />,
    );

    expect(screen.getByText(/Welcome back, An/i)).toBeInTheDocument();
    expect(screen.getByText("Frontend mock")).toBeInTheDocument();
    expect(screen.getByText(/Frontend Interview Track/)).toBeInTheDocument();
  });
});
