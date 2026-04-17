import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import type { AuthLoginResponse } from "@/lib/api/types";

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  register: (...args: unknown[]) => mockRegister(...args),
}));

describe("AuthProvider + useAuth", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("throws when useAuth is used outside provider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within AuthProvider",
    );
  });

  it("logs in and updates auth state", async () => {
    const payload: AuthLoginResponse = {
      token: "token-123",
      user: {
        email: "tester@example.com",
      },
    };

    mockLogin.mockResolvedValue(payload);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    await act(async () => {
      await result.current.login({
        email: "tester@example.com",
        password: "secret",
        remember: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe("token-123");
      expect(result.current.user?.email).toBe("tester@example.com");
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "tester@example.com",
      password: "secret",
    });
    expect(window.localStorage.getItem("idc_access_token")).toBe("token-123");
    expect(window.localStorage.getItem("idc_user")).toContain(
      "tester@example.com",
    );
  });

  it("logs out and clears auth state", async () => {
    const payload: AuthLoginResponse = {
      token: "token-abc",
      user: {
        email: "tester@example.com",
      },
    };

    mockLogin.mockResolvedValue(payload);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: "tester@example.com",
        password: "secret",
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });

    expect(window.localStorage.getItem("idc_access_token")).toBeNull();
    expect(window.localStorage.getItem("idc_user")).toBeNull();
  });

  it("calls register API", async () => {
    mockRegister.mockResolvedValue({ message: "Register success" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "new@example.com",
        password: "secret",
        full_name: "New User",
        target_role: "Frontend Developer",
        experience_level: "junior",
      });
    });

    expect(mockRegister).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "secret",
      full_name: "New User",
      target_role: "Frontend Developer",
      experience_level: "junior",
    });
  });
});
