import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";

describe("DashboardAchievements", () => {
  it("renders all four achievement items", () => {
    render(
      <DashboardAchievements
        totalSessions={0}
        avgScore={0}
        completedSessions={0}
      />,
    );

    expect(screen.getByText("First Step")).toBeInTheDocument();
    expect(screen.getByText("Gaining Momentum")).toBeInTheDocument();
    expect(screen.getByText("Consistency")).toBeInTheDocument();
    expect(screen.getByText("Excellence")).toBeInTheDocument();
  });

  it("renders achievement descriptions", () => {
    render(
      <DashboardAchievements
        totalSessions={0}
        avgScore={0}
        completedSessions={0}
      />,
    );

    expect(screen.getByText("Complete 1 interview")).toBeInTheDocument();
    expect(screen.getByText("Complete 5 interviews")).toBeInTheDocument();
    expect(screen.getByText("Maintain 80%+ average")).toBeInTheDocument();
    expect(screen.getByText("Achieve 95%+ score")).toBeInTheDocument();
  });

  it("shows 0/4 unlocked when no criteria are met", () => {
    render(
      <DashboardAchievements
        totalSessions={0}
        avgScore={0}
        completedSessions={0}
      />,
    );

    expect(screen.getByText("0/4")).toBeInTheDocument();
    expect(screen.queryAllByText("✓")).toHaveLength(0);
  });

  it("unlocks First Step at 1 total session", () => {
    render(
      <DashboardAchievements
        totalSessions={1}
        avgScore={0}
        completedSessions={1}
      />,
    );

    expect(screen.getByText("1/4")).toBeInTheDocument();
    expect(screen.getAllByText("✓")).toHaveLength(1);
  });

  it("unlocks Gaining Momentum at 5 total sessions", () => {
    render(
      <DashboardAchievements
        totalSessions={5}
        avgScore={0}
        completedSessions={5}
      />,
    );

    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getAllByText("✓")).toHaveLength(2);
  });

  it("unlocks Consistency at exactly 80% average score", () => {
    render(
      <DashboardAchievements
        totalSessions={5}
        avgScore={80}
        completedSessions={5}
      />,
    );

    expect(screen.getByText("3/4")).toBeInTheDocument();
  });

  it("unlocks Excellence at exactly 95% average score", () => {
    render(
      <DashboardAchievements
        totalSessions={5}
        avgScore={95}
        completedSessions={5}
      />,
    );

    expect(screen.getByText("4/4")).toBeInTheDocument();
    expect(screen.getAllByText("✓")).toHaveLength(4);
  });

  it("does NOT unlock Consistency below 80% score", () => {
    render(
      <DashboardAchievements
        totalSessions={5}
        avgScore={79}
        completedSessions={5}
      />,
    );

    expect(screen.getByText("2/4")).toBeInTheDocument();
  });

  it("shows celebration message when all achievements unlocked", () => {
    render(
      <DashboardAchievements
        totalSessions={5}
        avgScore={95}
        completedSessions={5}
      />,
    );

    expect(screen.getByText(/All Achievements Unlocked/)).toBeInTheDocument();
  });

  it("does not show celebration message when not all unlocked", () => {
    render(
      <DashboardAchievements
        totalSessions={0}
        avgScore={0}
        completedSessions={0}
      />,
    );

    expect(
      screen.queryByText(/All Achievements Unlocked/),
    ).not.toBeInTheDocument();
  });

  it("unlocks only completedSessions-based visual color for First Step", () => {
    render(
      <DashboardAchievements
        totalSessions={1}
        avgScore={0}
        completedSessions={0}
      />,
    );
    // totalSessions >= 1 → unlocked=true, but completedSessions < 1 → icon is gray
    // Achievement still shows as unlocked in count
    expect(screen.getByText("1/4")).toBeInTheDocument();
  });

  it("renders Achievements heading", () => {
    render(
      <DashboardAchievements
        totalSessions={0}
        avgScore={0}
        completedSessions={0}
      />,
    );

    expect(screen.getByText("Achievements")).toBeInTheDocument();
  });
});
