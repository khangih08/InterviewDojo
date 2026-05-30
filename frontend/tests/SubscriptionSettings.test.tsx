import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";

const mockUser = {
  id: "u-1",
  email: "test@example.com",
  full_name: "Test User",
  plan: "FREE",
  is_pending_pro: false,
};

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    hydrated: true,
    isAuthenticated: true,
    user: mockUser,
    loading: false,
  })),
}));

// Mock window.alert
const mockAlert = vi.fn();
Object.defineProperty(window, "alert", {
  writable: true,
  configurable: true,
  value: mockAlert,
});

describe("SubscriptionSettings", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
    vi.clearAllMocks();
  });


  it("renders correctly with Free plan default status in Vietnamese", async () => {
    render(<SubscriptionSettings />);
    
    // Kiểm tra tiêu đề
    expect(screen.getByText("Subscription Plan")).toBeInTheDocument();
    
    // Kiểm tra gói FREE có nhãn "Gói hiện tại"
    const freeCurrentBtn = screen.getByRole("button", { name: "Gói hiện tại" });
    expect(freeCurrentBtn).toBeInTheDocument();
    expect(freeCurrentBtn).toBeDisabled();
    
    // Kiểm tra gói PRO có nút "Nâng cấp lên PRO"
    const proBtn = screen.getByRole("button", { name: "Nâng cấp lên PRO" });
    expect(proBtn).toBeInTheDocument();
  });

  it("opens modal and allows sending PRO upgrade request successfully", async () => {
    render(<SubscriptionSettings />);
    
    // Nhấp nâng cấp lên PRO
    const proBtn = screen.getByRole("button", { name: "Nâng cấp lên PRO" });
    fireEvent.click(proBtn);
    
    // Hộp thoại quét mã QR hiển thị
    expect(screen.getByText("Nâng cấp tài khoản")).toBeInTheDocument();
    expect(screen.getByText("XÁC NHẬN ĐÃ CHUYỂN TIỀN")).toBeInTheDocument();
    
    // Nhấp nút xác nhận thanh toán
    const confirmBtn = screen.getByRole("button", { name: "XÁC NHẬN ĐÃ CHUYỂN TIỀN" });
    fireEvent.click(confirmBtn);
    
    // Đang gửi yêu cầu...
    expect(screen.getByRole("button", { name: "ĐANG GỬI..." })).toBeInTheDocument();

    // Chờ alert thông báo thành công từ API mock
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining("Hệ thống đã ghi nhận! Vui lòng chờ 1-5 phút")
      );
    });
  });
});
