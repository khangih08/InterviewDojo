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
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div>Pie</div>,
  Bar: () => <div>Bar</div>,
  Cell: () => <div>Cell</div>,
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
      <DashboardProgressCard
        loading
        errorMessage={null}
        chartData={[]}
        categoryData={[]}
        statusData={[]}
      />,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <DashboardProgressCard
        loading={false}
        errorMessage="Failed to load progress"
        chartData={[]}
        categoryData={[]}
        statusData={[]}
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
        categoryData={[{ category: "Frontend", sessions: 2 }]}
        statusData={[{ label: "Completed", value: 1 }]}
      />,
    );

    expect(screen.getAllByTestId("responsive-container")).toHaveLength(3);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("shows empty state when there is no data", () => {
    render(
      <DashboardProgressCard
        loading={false}
        errorMessage={null}
        chartData={[]}
        categoryData={[]}
        statusData={[]}
      />,
    );

    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });
});
