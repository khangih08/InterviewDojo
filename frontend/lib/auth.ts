import { User } from "./api/types";

export const ACCESS_TOKEN_COOKIE = "idc_access_token";
export const ACCESS_TOKEN_STORAGE = "idc_access_token";
export const ACCESS_TOKEN_SESSION = "idc_access_token_session";
export const REFRESH_TOKEN_COOKIE = "idc_refresh_token";
export const REFRESH_TOKEN_STORAGE = "idc_refresh_token";
export const REFRESH_TOKEN_SESSION = "idc_refresh_token_session";
export const USER_STORAGE = "idc_user";
export const USER_SESSION = "idc_user_session";

type CookieOptions = {
  days?: number | null;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function setCookie(name: string, value: string, options?: CookieOptions) {
  if (!isBrowser()) return;

  const days = options?.days;
  const path = options?.path ?? "/";
  const sameSite = options?.sameSite ?? "Lax";
  const secure = options?.secure ?? window.location.protocol === "https:";
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; Path=${path}; SameSite=${sameSite}`;

  if (typeof days === "number") {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    cookie += `; Expires=${expires}`;
  }

  if (secure) cookie += "; Secure";

  document.cookie = cookie;
}

function shouldPersist(
  remember: boolean | undefined,
  persistentKey: string,
): boolean {
  if (typeof remember === "boolean") {
    return remember;
  }

  if (!isBrowser()) {
    return false;
  }

  return window.localStorage.getItem(persistentKey) !== null;
}

function getCookie(name: string) {
  if (!isBrowser()) return null;

  const encoded = `${encodeURIComponent(name)}=`;
  for (const chunk of document.cookie.split(";")) {
    const value = chunk.trim();
    if (value.startsWith(encoded)) {
      return decodeURIComponent(value.slice(encoded.length));
    }
  }

  return null;
}

function deleteCookie(name: string) {
  if (!isBrowser()) return;

  document.cookie = `${encodeURIComponent(
    name,
  )}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
}

export function saveAccessToken(token: string, remember?: boolean) {
  if (!isBrowser()) return;

  const persist = shouldPersist(remember, ACCESS_TOKEN_STORAGE);

  setCookie(ACCESS_TOKEN_COOKIE, token, { days: persist ? 30 : null });

  if (persist) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE, token);
    window.sessionStorage.removeItem(ACCESS_TOKEN_SESSION);
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE);
  window.sessionStorage.setItem(ACCESS_TOKEN_SESSION, token);
}

export function saveRefreshToken(token: string, remember?: boolean) {
  if (!isBrowser()) return;

  const persist = shouldPersist(remember, REFRESH_TOKEN_STORAGE);

  setCookie(REFRESH_TOKEN_COOKIE, token, { days: persist ? 30 : null });

  if (persist) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE, token);
    window.sessionStorage.removeItem(REFRESH_TOKEN_SESSION);
    return;
  }

  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE);
  window.sessionStorage.setItem(REFRESH_TOKEN_SESSION, token);
}

export function getAccessToken() {
  if (!isBrowser()) return null;

  return (
    getCookie(ACCESS_TOKEN_COOKIE) ??
    window.sessionStorage.getItem(ACCESS_TOKEN_SESSION) ??
    window.localStorage.getItem(ACCESS_TOKEN_STORAGE)
  );
}

export function getRefreshToken() {
  if (!isBrowser()) return null;

  return (
    getCookie(REFRESH_TOKEN_COOKIE) ??
    window.sessionStorage.getItem(REFRESH_TOKEN_SESSION) ??
    window.localStorage.getItem(REFRESH_TOKEN_STORAGE)
  );
}

export function clearAccessToken() {
  if (!isBrowser()) return;

  deleteCookie(ACCESS_TOKEN_COOKIE);
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE);
  window.sessionStorage.removeItem(ACCESS_TOKEN_SESSION);
}

export function clearRefreshToken() {
  if (!isBrowser()) return;

  deleteCookie(REFRESH_TOKEN_COOKIE);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE);
  window.sessionStorage.removeItem(REFRESH_TOKEN_SESSION);
}

export function saveAuthTokens(input: {
  accessToken: string;
  refreshToken?: string;
  remember?: boolean;
}) {
  saveAccessToken(input.accessToken, input.remember);
  if (input.refreshToken) {
    saveRefreshToken(input.refreshToken, input.remember);
  }
}

export function clearAuthTokens() {
  clearAccessToken();
  clearRefreshToken();
}

export function saveUser(user: User, remember?: boolean) {
  if (!isBrowser()) return;

  const persist = shouldPersist(remember, USER_STORAGE);
  const serialized = JSON.stringify(user);

  if (persist) {
    window.localStorage.setItem(USER_STORAGE, serialized);
    window.sessionStorage.removeItem(USER_SESSION);
    return;
  }

  window.localStorage.removeItem(USER_STORAGE);
  window.sessionStorage.setItem(USER_SESSION, serialized);
}

export function getUser<T = User>() {
  if (!isBrowser()) return null as T | null;

  const raw =
    window.sessionStorage.getItem(USER_SESSION) ??
    window.localStorage.getItem(USER_STORAGE);
  if (!raw) return null as T | null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null as T | null;
  }
}

export function clearUser() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(USER_STORAGE);
  window.sessionStorage.removeItem(USER_SESSION);
}

export function logout() {
  clearAuthTokens();
  clearUser();
}

/**
 * Aliases để tương thích với code khác
 */
export const saveToken = saveAccessToken;
export const getToken = getAccessToken;
export const setAccessToken = saveAccessToken;
export const setUser = saveUser;
export const clearAuth = logout;
