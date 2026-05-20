import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import * as toastModule from "@/lib/toast";

vi.mock("@/lib/toast", () => ({
  toastSuccess: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    hydrated: true,
    isAuthenticated: true,
    user: null,
    loading: false,
  })),
}));

describe("SubscriptionSettings and Context", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <SubscriptionProvider>
        <SubscriptionSettings />
      </SubscriptionProvider>
    );
  };

  it("defaults to Free plan and shows 'Current Plan' badge on Free plan", async () => {
    renderComponent();
    
    // Check that "Free" plan has the "Current Plan" text
    expect(await screen.findByText("Current Plan")).toBeInTheDocument();
    
    // Check that there's an "Active Plan" button
    const activeBtn = screen.getByRole("button", { name: /Active Plan/i });
    expect(activeBtn).toBeDisabled();
    
    // Check that Pro and Teams have "Upgrade" buttons
    expect(screen.getByRole("button", { name: /Upgrade to Pro/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Upgrade to Teams/i })).toBeInTheDocument();
  });

  it("opens upgrade dialog when clicking upgrade button", async () => {
    renderComponent();
    
    const upgradeProBtn = await screen.findByRole("button", { name: /Upgrade to Pro/i });
    fireEvent.click(upgradeProBtn);
    
    // Dialog opens and shows text
    expect(await screen.findByText(/You're about to upgrade to the Pro plan/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirm Upgrade/i })).toBeInTheDocument();
  });

  it("updates current plan and saves to localStorage after successful upgrade", async () => {
    renderComponent();
    
    const upgradeProBtn = await screen.findByRole("button", { name: /Upgrade to Pro/i });
    fireEvent.click(upgradeProBtn);
    
    const confirmBtn = await screen.findByRole("button", { name: /Confirm Upgrade/i });
    fireEvent.click(confirmBtn);
    
    // Expect button to show loading
    expect(screen.getByRole("button", { name: /Upgrading\.\.\./i })).toBeInTheDocument();
    
    // Wait for the simulated delay
    await waitFor(() => {
      expect(toastModule.toastSuccess).toHaveBeenCalledWith("Upgraded to Pro successfully!");
    }, { timeout: 2000 });
    
    // Check localStorage
    const saved = localStorage.getItem("idc_subscription");
    expect(saved).toContain('"currentPlan":"Pro"');
    
    // Check UI updated
    const downgradeFreeBtn = await screen.findByRole("button", { name: /Downgrade to Free/i });
    expect(downgradeFreeBtn).toBeInTheDocument();
  });

  it("shows downgrade dialog and returns to Free plan after downgrade", async () => {
    // Setup initial state as Pro
    localStorage.setItem("idc_subscription", JSON.stringify({ currentPlan: "Pro", subscribedAt: new Date().toISOString() }));
    
    renderComponent();
    
    const downgradeFreeBtn = await screen.findByRole("button", { name: /Downgrade to Free/i });
    fireEvent.click(downgradeFreeBtn);
    
    // Dialog opens
    expect(await screen.findByText(/Downgrade to Free\?/i)).toBeInTheDocument();
    
    const confirmDowngradeBtn = screen.getByRole("button", { name: /Downgrade ↓/i });
    fireEvent.click(confirmDowngradeBtn);
    
    // Wait for simulated delay
    await waitFor(() => {
      expect(toastModule.toastInfo).toHaveBeenCalledWith("Downgraded to Free plan");
    }, { timeout: 1500 });
    
    // Check localStorage is back to Free
    const saved = localStorage.getItem("idc_subscription");
    expect(saved).toContain('"currentPlan":"Free"');
    
    // UI is back to Free
    expect(await screen.findByRole("button", { name: /Active Plan/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Upgrade to Pro/i })).toBeInTheDocument();
  });
});
