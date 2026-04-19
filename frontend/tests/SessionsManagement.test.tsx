import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionsManagement } from "@/components/dashboard/SessionsManagement";

const mockGetAllSessions = vi.fn();
const mockRevokeAllSessions = vi.fn();
const mockRevokeSession = vi.fn();
const mockRevokeAllOtherSessions = vi.fn();
const mockLogout = vi.fn();

vi.mock("@/lib/api/sessions", () => ({
  userSessionsApi: {
    getAllSessions: (...args: unknown[]) => mockGetAllSessions(...args),
    revokeAllSessions: (...args: unknown[]) => mockRevokeAllSessions(...args),
    revokeSession: (...args: unknown[]) => mockRevokeSession(...args),
    revokeAllOtherSessions: (...args: unknown[]) =>
      mockRevokeAllOtherSessions(...args),
  },
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

vi.mock("@/lib/toast", () => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

describe("SessionsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetAllSessions.mockResolvedValue([
      {
        id: "s-1",
        device_name: "Chrome on Windows",
        user_agent: "Chrome",
        ip_address: "127.0.0.1",
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        expires_at: null,
        is_active: true,
      },
      {
        id: "s-2",
        device_name: "Safari on macOS",
        user_agent: "Safari",
        ip_address: "10.10.10.10",
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        expires_at: null,
        is_active: true,
      },
    ]);

    mockRevokeAllSessions.mockResolvedValue({ revoked_count: 2 });
  });

  it("loads and displays active sessions", async () => {
    render(<SessionsManagement />);

    expect(await screen.findByText("Chrome on Windows")).toBeInTheDocument();
    expect(screen.getByText("Safari on macOS")).toBeInTheDocument();
  });

  it("logs out and redirects to login when revoking all devices", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const assignSpy = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign: assignSpy,
    });

    render(<SessionsManagement />);

    const button = await screen.findByRole("button", {
      name: "Logout All Devices",
    });

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockRevokeAllSessions).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(assignSpy).toHaveBeenCalledWith("/login");
    });

    vi.unstubAllGlobals();
  });

  it("does not call revoke all when confirmation is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<SessionsManagement />);

    const button = await screen.findByRole("button", {
      name: "Logout All Devices",
    });

    await userEvent.click(button);

    expect(mockRevokeAllSessions).not.toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
