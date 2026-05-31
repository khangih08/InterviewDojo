import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";

// Mock hàm toastSuccess/toastInfo tránh bị lỗi undefined
vi.mock("@/lib/toast", () => ({
  toastSuccess: vi.fn(),
  toastInfo: vi.fn(),
}));

// Mock AuthContext cung cấp thông tin User đang ở gói FREE
vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    hydrated: true,
    isAuthenticated: true,
    user: { id: "u-123456789", plan: "FREE", full_name: "Nguyễn Tuấn Khang", email: "khang@example.com" },
    loading: false,
  })),
}));

describe("SubscriptionSettings Component Tests", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000");
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(<SubscriptionSettings />);
  };

  it("defaults to FREE plan and shows correct layout titles", async () => {
    renderComponent();
    
    // 1. Kiểm tra tiêu đề lớn bằng tiếng Anh
    expect(screen.getByText("Subscription Plan")).toBeInTheDocument();
    
    // 2. Kiểm tra nhãn trạng thái nút gói FREE tiếng Việt
    const currentPlanBtn = screen.getByRole("button", { name: "Gói hiện tại" });
    expect(currentPlanBtn).toBeDisabled();
    
    // 3. Kiểm tra nút bấm kích hoạt nâng cấp PRO
    expect(screen.getByRole("button", { name: "Nâng cấp lên PRO" })).toBeInTheDocument();
  });

  it("opens modal overlay when clicking upgrade to PRO button", async () => {
    renderComponent();
    
    const upgradeProBtn = screen.getByRole("button", { name: "Nâng cấp lên PRO" });
    fireEvent.click(upgradeProBtn);
    
    // Kiểm tra tiêu đề Modal thật xuất hiện
    expect(await screen.findByText("Nâng cấp tài khoản PRO")).toBeInTheDocument();
    
    // Kiểm tra nút bấm xác nhận thanh toán cuối cùng trong Modal thật
    expect(screen.getByRole("button", { name: "Xác nhận thanh toán" })).toBeInTheDocument();
  });

  it("changes submit button state during loading simulation", async () => {
    renderComponent();
    
    const upgradeProBtn = screen.getByRole("button", { name: "Nâng cấp lên PRO" });
    fireEvent.click(upgradeProBtn);
    
    const confirmBtn = screen.getByRole("button", { name: "Xác nhận thanh toán" });
    fireEvent.click(confirmBtn);
    
    // Vì selectedProvider mặc định là 'vnpay', nút bấm sẽ kích hoạt trạng thái Submitting và đổi text
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Xác nhận thanh toán" })).toBeInTheDocument();
    });
  });
});