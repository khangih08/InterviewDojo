import { beforeEach, describe, expect, it } from "vitest";

import {
  ACCESS_TOKEN_SESSION,
  ACCESS_TOKEN_STORAGE,
  REFRESH_TOKEN_SESSION,
  REFRESH_TOKEN_STORAGE,
  USER_SESSION,
  USER_STORAGE,
  clearAuthTokens,
  clearUser,
  getAccessToken,
  getRefreshToken,
  getUser,
  saveAuthTokens,
  saveUser,
} from "@/lib/auth";

describe("auth storage persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearAuthTokens();
    clearUser();
  });

  it("stores token and user in sessionStorage when remember is false", () => {
    saveAuthTokens({
      accessToken: "access-session",
      refreshToken: "refresh-session",
      remember: false,
    });
    saveUser({ email: "session@example.com" }, false);

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE)).toBeNull();
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE)).toBeNull();
    expect(window.localStorage.getItem(USER_STORAGE)).toBeNull();

    expect(window.sessionStorage.getItem(ACCESS_TOKEN_SESSION)).toBe(
      "access-session",
    );
    expect(window.sessionStorage.getItem(REFRESH_TOKEN_SESSION)).toBe(
      "refresh-session",
    );
    expect(window.sessionStorage.getItem(USER_SESSION)).toContain(
      "session@example.com",
    );

    expect(getAccessToken()).toBe("access-session");
    expect(getRefreshToken()).toBe("refresh-session");
    expect(getUser()?.email).toBe("session@example.com");
  });

  it("stores token and user in localStorage when remember is true", () => {
    saveAuthTokens({
      accessToken: "access-local",
      refreshToken: "refresh-local",
      remember: true,
    });
    saveUser({ email: "local@example.com" }, true);

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE)).toBe(
      "access-local",
    );
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE)).toBe(
      "refresh-local",
    );
    expect(window.localStorage.getItem(USER_STORAGE)).toContain(
      "local@example.com",
    );

    expect(window.sessionStorage.getItem(ACCESS_TOKEN_SESSION)).toBeNull();
    expect(window.sessionStorage.getItem(REFRESH_TOKEN_SESSION)).toBeNull();
    expect(window.sessionStorage.getItem(USER_SESSION)).toBeNull();

    expect(getAccessToken()).toBe("access-local");
    expect(getRefreshToken()).toBe("refresh-local");
    expect(getUser()?.email).toBe("local@example.com");
  });

  it("keeps persistent mode when remember is omitted after a remembered login", () => {
    saveAuthTokens({
      accessToken: "first-access",
      refreshToken: "first-refresh",
      remember: true,
    });
    saveUser({ email: "first@example.com" }, true);

    // Simulate refresh flow where remember is not passed.
    saveAuthTokens({
      accessToken: "refreshed-access",
      refreshToken: "refreshed-refresh",
    });
    saveUser({ email: "refreshed@example.com" });

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE)).toBe(
      "refreshed-access",
    );
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE)).toBe(
      "refreshed-refresh",
    );
    expect(window.localStorage.getItem(USER_STORAGE)).toContain(
      "refreshed@example.com",
    );

    expect(window.sessionStorage.getItem(ACCESS_TOKEN_SESSION)).toBeNull();
    expect(window.sessionStorage.getItem(REFRESH_TOKEN_SESSION)).toBeNull();
    expect(window.sessionStorage.getItem(USER_SESSION)).toBeNull();
  });

  it("keeps session mode when remember is omitted after a non-remembered login", () => {
    saveAuthTokens({
      accessToken: "first-session-access",
      refreshToken: "first-session-refresh",
      remember: false,
    });
    saveUser({ email: "first-session@example.com" }, false);

    // Simulate refresh flow where remember is not passed.
    saveAuthTokens({
      accessToken: "next-session-access",
      refreshToken: "next-session-refresh",
    });
    saveUser({ email: "next-session@example.com" });

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE)).toBeNull();
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE)).toBeNull();
    expect(window.localStorage.getItem(USER_STORAGE)).toBeNull();

    expect(window.sessionStorage.getItem(ACCESS_TOKEN_SESSION)).toBe(
      "next-session-access",
    );
    expect(window.sessionStorage.getItem(REFRESH_TOKEN_SESSION)).toBe(
      "next-session-refresh",
    );
    expect(window.sessionStorage.getItem(USER_SESSION)).toContain(
      "next-session@example.com",
    );
  });
});
