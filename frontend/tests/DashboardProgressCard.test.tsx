import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  CartesianGrid: () => <div>CartesianGrid</div>,
  Line: () => <div>Line</div>,
  Tooltip: () => <div>Tooltip</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
}));

import { DashboardProgressCard } from "@/components/dashboard/DashboardProgressCard";

describe("DashboardProgressCard", () => {
  it("shows loading state", () => {
    render(
      <DashboardProgressCard loading errorMessage={null} chartData={[]} />,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <DashboardProgressCard
        loading={false}
        errorMessage="Failed to load progress"
        chartData={[]}
      />,
    );

    expect(screen.getByText("Failed to load progress")).toBeInTheDocument();
  });

  it("renders chart when data exists", () => {
    render(
      <DashboardProgressCard
        loading={false}
        errorMessage={null}
        chartData={[{ date: "Apr 20", score: 80 }]}
      />,
    );

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("shows empty state when there is no data", () => {
    render(
      <DashboardProgressCard loading={false} errorMessage={null} chartData={[]} />,
    );

    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });
});
