import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    hydrated: true,
    isAuthenticated: true,
  })),
}));

vi.mock("@/lib/api/sessions", () => ({
  userSessionsApi: {
    getAllSessions: vi.fn(),
    revokeSession: vi.fn(),
    revokeAllOtherSessions: vi.fn(),
    revokeAllSessions: vi.fn(),
  },
}));

vi.mock("@/lib/toast", () => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

import { userSessionsApi } from "@/lib/api/sessions";
import { toastError, toastSuccess } from "@/lib/toast";
import { SessionsManagement } from "@/components/dashboard/SessionsManagement";

const mockSession = {
  id: "s-1",
  device_name: "Chrome on Windows",
  user_agent: "Mozilla/5.0",
  ip_address: "127.0.0.1",
  created_at: "2026-01-01T00:00:00.000Z",
  last_accessed_at: "2026-01-02T00:00:00.000Z",
  expires_at: "2027-01-01T00:00:00.000Z",
  is_active: true,
};

const mockSession2 = {
  ...mockSession,
  id: "s-2",
  device_name: "Firefox on Mac",
  ip_address: "192.168.1.2",
};

describe("SessionsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner while fetching sessions", () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    );
    const { container } = render(<SessionsManagement />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders session list after loading completes", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    });
  });

  it("shows empty state message when there are no sessions", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(
        screen.getByText("No active sessions found"),
      ).toBeInTheDocument();
    });
  });

  it("displays the IP address for each session", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText("IP: 127.0.0.1")).toBeInTheDocument();
    });
  });

  it("shows 'Logout Other Devices' button only when there are multiple sessions", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession, mockSession2],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(
        screen.getByText(/Logout Other Devices/),
      ).toBeInTheDocument();
    });
  });

  it("does not show 'Logout Other Devices' with a single session", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Logout Other Devices/),
    ).not.toBeInTheDocument();
  });

  it("revokes a session and removes it from the list", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    (userSessionsApi.revokeSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      { message: "ok" },
    );

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText("Chrome on Windows"));

    await userEvent.click(screen.getByTitle("Revoke this session"));

    await waitFor(() => {
      expect(userSessionsApi.revokeSession).toHaveBeenCalledWith("s-1");
      expect(toastSuccess).toHaveBeenCalled();
      expect(
        screen.queryByText("Chrome on Windows"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error toast when loading sessions fails", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error"),
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Failed to load sessions");
    });
  });

  it("shows error toast when revoking a session fails", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    (userSessionsApi.revokeSession as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("fail"),
    );

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText("Chrome on Windows"));

    await userEvent.click(screen.getByTitle("Revoke this session"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Failed to revoke session");
    });
  });

  it("shows 'Expired' badge for sessions past their expiry date", async () => {
    const expiredSession = {
      ...mockSession,
      expires_at: "2020-01-01T00:00:00.000Z",
    };
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [expiredSession],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText("Expired")).toBeInTheDocument();
    });
  });

  it("shows expiry date for non-expired sessions", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Expires:/)).toBeInTheDocument();
    });
  });

  it("revokes all other sessions on button click", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession, mockSession2],
    );
    (
      userSessionsApi.revokeAllOtherSessions as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ message: "ok", revoked_count: 1 });
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([mockSession, mockSession2])
      .mockResolvedValueOnce([mockSession]);

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText(/Logout Other Devices/));

    await userEvent.click(screen.getByText(/Logout Other Devices/));

    await waitFor(() => {
      expect(userSessionsApi.revokeAllOtherSessions).toHaveBeenCalled();
      expect(toastSuccess).toHaveBeenCalled();
    });
  });

  it("shows error toast when revoking all other sessions fails", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession, mockSession2],
    );
    (
      userSessionsApi.revokeAllOtherSessions as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("fail"));

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText(/Logout Other Devices/));

    await userEvent.click(screen.getByText(/Logout Other Devices/));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Failed to revoke sessions");
    });
  });

  it("revokes all sessions when user confirms the dialog", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    (
      userSessionsApi.revokeAllSessions as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ message: "ok", revoked_count: 1 });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText(/Logout All Devices/));

    await userEvent.click(screen.getByText(/Logout All Devices/));

    await waitFor(() => {
      expect(userSessionsApi.revokeAllSessions).toHaveBeenCalled();
      expect(toastSuccess).toHaveBeenCalled();
    });
  });

  it("does not revoke all sessions when user cancels the dialog", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText(/Logout All Devices/));

    await userEvent.click(screen.getByText(/Logout All Devices/));

    expect(userSessionsApi.revokeAllSessions).not.toHaveBeenCalled();
  });

  it("shows error toast when revoking all sessions fails", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [mockSession],
    );
    (
      userSessionsApi.revokeAllSessions as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("fail"));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<SessionsManagement />);
    await waitFor(() => screen.getByText(/Logout All Devices/));

    await userEvent.click(screen.getByText(/Logout All Devices/));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Failed to revoke all sessions");
    });
  });

  it("renders the heading and description text", async () => {
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText("Active Sessions")).toBeInTheDocument();
      expect(
        screen.getByText(/Manage your active sessions/),
      ).toBeInTheDocument();
    });
  });

  it("shows 'Unknown Device' when device_name is null", async () => {
    const sessionNoDevice = { ...mockSession, device_name: null };
    (userSessionsApi.getAllSessions as ReturnType<typeof vi.fn>).mockResolvedValue(
      [sessionNoDevice],
    );
    render(<SessionsManagement />);

    await waitFor(() => {
      expect(screen.getByText("Unknown Device")).toBeInTheDocument();
    });
  });
});
