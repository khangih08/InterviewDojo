import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPost } = vi.hoisted(() => ({
  mockPost: vi.fn(),
}));

vi.mock("@/lib/api/mock", () => ({ shouldUseMocks: vi.fn(() => false) }));
vi.mock("@/lib/auth", () => ({
  getRefreshToken: vi.fn(() => "stored-refresh-token"),
  getAccessToken: vi.fn(() => "stored-access-token"),
}));
vi.mock("@/lib/mocks/auth", () => ({
  mockLogin: vi.fn(),
  mockForgotPassword: vi.fn(),
  mockResetPassword: vi.fn(),
  mockVerifyPasswordCode: vi.fn(),
}));
vi.mock("@/lib/api/http", () => ({
  http: { post: mockPost },
  toApiError: vi.fn((e: any) => ({ message: e?.message ?? "Unknown error" })),
}));

import {
  login,
  register,
  logoutApi,
  googleLogin,
  googleRegisterStart,
  googleRegisterVerify,
  completeGoogleProfile,
  forgotPassword,
  verifyForgotPasswordCode,
  resetPassword,
  refreshAccessToken,
} from "@/lib/api/auth";
import { getRefreshToken } from "@/lib/auth";

const authResponse = {
  token: "access-token",
  refreshToken: "refresh-token",
  user: { id: "u-1", email: "test@example.com" },
};

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRefreshToken).mockReturnValue("stored-refresh-token");
  });

  describe("login", () => {
    it("calls /auth/login and returns response data", async () => {
      mockPost.mockResolvedValue({ data: authResponse });

      const result = await login({ email: "a@b.com", password: "pw" });

      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "a@b.com",
        password: "pw",
      });
      expect(result).toEqual(authResponse);
    });

    it("throws with error message on failure", async () => {
      mockPost.mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        login({ email: "x@y.com", password: "bad" }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("register", () => {
    it("calls /auth/register and returns response data", async () => {
      mockPost.mockResolvedValue({ data: { message: "registered" } });

      const result = await register({
        email: "new@example.com",
        password: "pw",
        full_name: "New",
        target_role: "Frontend Developer" as any,
        experience_level: "junior" as any,
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/register",
        expect.any(Object),
      );
      expect(result).toEqual({ message: "registered" });
    });

    it("throws on registration failure", async () => {
      mockPost.mockRejectedValue(new Error("Email taken"));

      await expect(
        register({
          email: "a@b.com",
          password: "pw",
          full_name: "A",
          target_role: "Frontend Developer" as any,
          experience_level: "junior" as any,
        }),
      ).rejects.toThrow("Email taken");
    });
  });

  describe("logoutApi", () => {
    it("calls /auth/logout endpoint", async () => {
      mockPost.mockResolvedValue({});

      await logoutApi();

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/logout",
        {},
        expect.objectContaining({
          headers: expect.objectContaining({ "x-skip-error-toast": "1" }),
        }),
      );
    });

    it("does not throw on logout failure (no-op)", async () => {
      mockPost.mockRejectedValue(new Error("Server error"));

      await expect(logoutApi()).resolves.toBeUndefined();
    });
  });

  describe("googleLogin", () => {
    it("calls /auth/google/login and returns response", async () => {
      mockPost.mockResolvedValue({ data: authResponse });

      const result = await googleLogin({ idToken: "google-id-token" });

      expect(mockPost).toHaveBeenCalledWith("/auth/google/login", {
        idToken: "google-id-token",
      });
      expect(result).toEqual(authResponse);
    });

    it("throws on invalid token", async () => {
      mockPost.mockRejectedValue(new Error("Invalid Google token"));

      await expect(googleLogin({ idToken: "bad" })).rejects.toThrow(
        "Invalid Google token",
      );
    });
  });

  describe("googleRegisterStart", () => {
    it("calls /auth/google/register and returns response", async () => {
      const response = {
        message: "code sent",
        email: "a@b.com",
        full_name: "A",
      };
      mockPost.mockResolvedValue({ data: response });

      const result = await googleRegisterStart({
        idToken: "gt",
        target_role: "Frontend Developer" as any,
        experience_level: "junior" as any,
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/google/register",
        expect.any(Object),
      );
      expect(result).toEqual(response);
    });
  });

  describe("googleRegisterVerify", () => {
    it("calls /auth/google/register/verify and returns auth response", async () => {
      mockPost.mockResolvedValue({ data: authResponse });

      const result = await googleRegisterVerify({
        email: "a@b.com",
        code: "1234",
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/google/register/verify",
        expect.any(Object),
      );
      expect(result).toEqual(authResponse);
    });
  });

  describe("completeGoogleProfile", () => {
    it("calls /auth/google/complete-profile and returns response", async () => {
      const response = { message: "completed", user: {} };
      mockPost.mockResolvedValue({ data: response });

      const result = await completeGoogleProfile({
        full_name: "A",
        target_role: "Frontend Developer" as any,
        experience_level: "junior" as any,
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/google/complete-profile",
        expect.any(Object),
      );
      expect(result).toEqual(response);
    });
  });

  describe("forgotPassword", () => {
    it("calls /auth/forgot-password and returns message", async () => {
      mockPost.mockResolvedValue({ data: { message: "code sent" } });

      const result = await forgotPassword({ email: "a@b.com" });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/forgot-password",
        expect.any(Object),
      );
      expect(result.message).toBe("code sent");
    });
  });

  describe("verifyForgotPasswordCode", () => {
    it("calls /auth/forgot-password/verify and returns message", async () => {
      mockPost.mockResolvedValue({ data: { message: "verified" } });

      const result = await verifyForgotPasswordCode({
        email: "a@b.com",
        code: "1234",
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/forgot-password/verify",
        expect.any(Object),
      );
      expect(result.message).toBe("verified");
    });
  });

  describe("resetPassword", () => {
    it("calls /auth/forgot-password/reset and returns message", async () => {
      mockPost.mockResolvedValue({ data: { message: "password reset" } });

      const result = await resetPassword({
        email: "a@b.com",
        code: "1234",
        password: "NewPass#1",
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/forgot-password/reset",
        expect.any(Object),
      );
      expect(result.message).toBe("password reset");
    });
  });

  describe("refreshAccessToken", () => {
    it("calls /auth/refresh with Bearer refresh token", async () => {
      mockPost.mockResolvedValue({ data: authResponse });

      const result = await refreshAccessToken();

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/refresh",
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer stored-refresh-token",
          }),
        }),
      );
      expect(result).toEqual(authResponse);
    });

    it("throws when refresh token is missing", async () => {
      vi.mocked(getRefreshToken).mockReturnValue(null);

      await expect(refreshAccessToken()).rejects.toThrow(
        "Missing refresh token",
      );
      expect(mockPost).not.toHaveBeenCalled();
    });

    it("throws on network failure", async () => {
      mockPost.mockRejectedValue(new Error("Network error"));

      await expect(refreshAccessToken()).rejects.toThrow("Network error");
    });
  });
});
