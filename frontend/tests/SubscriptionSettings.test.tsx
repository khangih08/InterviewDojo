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

  it("defaults to Free plan and shows current status in Vietnamese", async () => {
    renderComponent();
    
    // Kiểm tra text gói hiện tại tiếng Việt hiển thị
    expect(await screen.findByText("Gói hiện tại")).toBeInTheDocument();
    
    const activeBtn = screen.getByRole("button", { name: /Gói hiện tại/i });
    expect(activeBtn).toBeDisabled();
    
    // Tìm nút Nâng cấp của các gói còn lại
    expect(screen.getAllByRole("button", { name: /Nâng cấp/i })[0]).toBeInTheDocument();
  });

  it("opens upgrade dialog when clicking upgrade button", async () => {
    renderComponent();
    
    const upgradeProBtn = screen.getAllByRole("button", { name: /Nâng cấp/i })[0];
    fireEvent.click(upgradeProBtn);
    
    // Hộp thoại Modal quét mã VietQR MB Bank hiển thị thành công
    expect(await screen.findByText(/Nâng cấp tài khoản/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /XÁC NHẬN ĐÃ CHUYỂN TIỀN/i })).toBeInTheDocument();
  });

  it("updates current plan after successful upgrade simulation", async () => {
    renderComponent();
    
    const upgradeProBtn = screen.getAllByRole("button", { name: /Nâng cấp/i })[0];
    fireEvent.click(upgradeProBtn);
    
    const confirmBtn = screen.getByRole("button", { name: /XÁC NHẬN ĐÃ CHUYỂN TIỀN/i });
    fireEvent.click(confirmBtn);
    
    // Đợi xử lý delay của toast thông báo thành công
    await waitFor(() => {
      expect(toastModule.toastSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});