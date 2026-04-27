import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardRecentCard } from "@/components/dashboard/DashboardRecentCard";
import type { Session } from "@/lib/api/types";

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s-1",
    status: "COMPLETED",
    created_at: "2024-01-15T10:00:00Z",
    question_content: "Tell me about yourself",
    ai_analysis: { technical_score: 80, communication_score: 90 },
    ...overrides,
  };
}

describe("DashboardRecentCard", () => {
  it("shows loading text when loading is true", () => {
    render(<DashboardRecentCard sessions={[]} loading />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty state when there are no sessions", () => {
    render(<DashboardRecentCard sessions={[]} loading={false} />);

    expect(screen.getByText("No sessions yet")).toBeInTheDocument();
  });

  it("renders session question content", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ question_content: "Explain REST vs GraphQL" })]}
        loading={false}
      />,
    );

    expect(screen.getByText(/Explain REST vs GraphQL/)).toBeInTheDocument();
  });

  it("truncates question content longer than 40 characters", () => {
    const longContent = "A".repeat(45);
    render(
      <DashboardRecentCard
        sessions={[makeSession({ question_content: longContent })]}
        loading={false}
      />,
    );

    // React renders the substring and "..." as separate text nodes inside the <p>
    const el = screen.getByText(
      (_, node) => node?.tagName === "P" && (node?.textContent ?? "").endsWith("..."),
    );
    expect(el).toBeInTheDocument();
  });

  it("shows fallback text when question_content is missing", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ question_content: undefined })]}
        loading={false}
      />,
    );

    expect(screen.getByText("Interview Session")).toBeInTheDocument();
  });

  it("shows Hoàn thành badge for COMPLETED sessions", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ status: "COMPLETED" })]}
        loading={false}
      />,
    );

    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
  });

  it("shows Đang xử lý badge for PROCESSING sessions", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ status: "PROCESSING" })]}
        loading={false}
      />,
    );

    expect(screen.getByText("Đang xử lý")).toBeInTheDocument();
  });

  it("shows Thất bại badge for FAILED sessions", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ status: "FAILED" })]}
        loading={false}
      />,
    );

    expect(screen.getByText("Thất bại")).toBeInTheDocument();
  });

  it("shows average score for COMPLETED sessions", () => {
    render(
      <DashboardRecentCard
        sessions={[
          makeSession({
            status: "COMPLETED",
            ai_analysis: { technical_score: 80, communication_score: 90 },
          }),
        ]}
        loading={false}
      />,
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("does not show score for PROCESSING sessions", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ status: "PROCESSING", ai_analysis: null })]}
        loading={false}
      />,
    );

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("shows at most 5 sessions when given more", () => {
    const sessions = Array.from({ length: 7 }, (_, i) =>
      makeSession({ id: `s-${i}`, question_content: `Question ${i}` }),
    );

    render(<DashboardRecentCard sessions={sessions} loading={false} />);

    expect(screen.getAllByText(/Question \d/).length).toBe(5);
  });

  it("shows 0% score when ai_analysis is null", () => {
    render(
      <DashboardRecentCard
        sessions={[makeSession({ status: "COMPLETED", ai_analysis: null })]}
        loading={false}
      />,
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
