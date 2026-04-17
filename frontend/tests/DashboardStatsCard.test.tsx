import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";

describe("DashboardStatsCard", () => {
  it("renders all stats with correct values", () => {
    render(
      <DashboardStatsCard totalSessions={12} avgScore={78} bestScore={95} />,
    );

    expect(screen.getByText("Total Sessions")).toBeInTheDocument();
    expect(screen.getByText("Average Score")).toBeInTheDocument();
    expect(screen.getByText("Best Score")).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
  });
});
