import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardNextActionCard } from "@/components/dashboard/DashboardNextActionCard";

describe("DashboardNextActionCard", () => {
  it("renders guide content and focus topics", () => {
    render(
      <DashboardNextActionCard
        guide={{
          greeting: "Hi",
          targetRoleLabel: "Backend Developer",
          nextAction: "Practice system design today",
          focusTopics: ["Caching", "Queues", "Indexes"],
          planName: "Backend Sprint",
          planSummary: "Focus on architecture and data modeling",
        }}
      />,
    );

    expect(screen.getByText("Next Action")).toBeInTheDocument();
    expect(screen.getByText("Practice system design today")).toBeInTheDocument();
    expect(screen.getByText("Focus Topics")).toBeInTheDocument();
    expect(screen.getByText("Caching")).toBeInTheDocument();
    expect(screen.getByText("Queues")).toBeInTheDocument();
    expect(screen.getByText("Indexes")).toBeInTheDocument();
    expect(screen.getByText("Backend Sprint")).toBeInTheDocument();
    expect(
      screen.getByText("Focus on architecture and data modeling"),
    ).toBeInTheDocument();
  });
});
