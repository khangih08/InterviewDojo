import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardNextActionCard } from "@/components/dashboard/DashboardNextActionCard";
import { SubscriptionProvider } from "@/contexts/subscription-context";

const mockUser = {
  id: "u-1",
  target_role: "Backend Developer",
};

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
  })),
}));

describe("DashboardNextActionCard", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
  });

  it("renders guide content and focus topics from MSW api mock", async () => {

    render(
      <SubscriptionProvider>
        <DashboardNextActionCard />
      </SubscriptionProvider>
    );

    // Đợi render thành công sau khi tải dữ liệu từ MSW API giả lập
    await waitFor(() => {
      expect(screen.getByText("Practice system design today")).toBeInTheDocument();
    }, { timeout: 4000 });

    expect(screen.getByText("Caching")).toBeInTheDocument();
    expect(screen.getByText("Queues")).toBeInTheDocument();
    expect(screen.getByText("Indexes")).toBeInTheDocument();
    expect(screen.getByText("Backend Sprint")).toBeInTheDocument();
    expect(
      screen.getByText("Focus on architecture and data modeling"),
    ).toBeInTheDocument();
  });
});
