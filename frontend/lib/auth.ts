import { User } from "./api/types";

export const ACCESS_TOKEN_COOKIE = "idc_access_token";
export const ACCESS_TOKEN_STORAGE = "idc_access_token";
export const USER_STORAGE = "idc_user";

type CookieOptions = {
  days?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function setCookie(name: string, value: string, options?: CookieOptions) {
  if (!isBrowser()) return;

  const days = options?.days ?? 1;
  const path = options?.path ?? "/";
  const sameSite = options?.sameSite ?? "Lax";
  const secure = options?.secure ?? window.location.protocol === "https:";
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; Expires=${expires}; Path=${path}; SameSite=${sameSite}`;

  if (secure) cookie += "; Secure";

  document.cookie = cookie;
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
    name
  )}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
}

export function saveAccessToken(token: string, remember = false) {
  if (!isBrowser()) return;

  setCookie(ACCESS_TOKEN_COOKIE, token, { days: remember ? 30 : 1 });
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE, token);
}

export function getAccessToken() {
  if (!isBrowser()) return null;

  return (
    getCookie(ACCESS_TOKEN_COOKIE) ??
    window.localStorage.getItem(ACCESS_TOKEN_STORAGE)
  );
}

export function clearAccessToken() {
  if (!isBrowser()) return;

  deleteCookie(ACCESS_TOKEN_COOKIE);
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE);
}

export function saveUser(user: User) {
  if (!isBrowser()) return;

  window.localStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export function getUser<T = User>() {
  if (!isBrowser()) return null as T | null;

  const raw = window.localStorage.getItem(USER_STORAGE);
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
}

export function logout() {
  clearAccessToken();
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