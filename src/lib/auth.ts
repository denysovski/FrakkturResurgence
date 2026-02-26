import { apiFetch, setAuthToken, getAuthToken } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  status: "active" | "inactive";
};

const USER_KEY = "frakktur_auth_user";
const LEGACY_LOCAL_USERS_KEY = "frakktur_local_auth_users";

type AuthApiResponse = {
  token: string;
  user: AuthUser;
};

const isLegacyLocalToken = (token: string | null) => Boolean(token && token.startsWith("local-auth-"));

const parseJwtPayload = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
};

const isJwtExpired = (token: string) => {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
};

const purgeLegacyLocalAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  const token = getAuthToken();
  if (isLegacyLocalToken(token)) {
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
  }

  localStorage.removeItem(LEGACY_LOCAL_USERS_KEY);
};

purgeLegacyLocalAuth();

const commitSession = (user: AuthUser, token: string) => {
  setAuthToken(token);
  setStoredUser(user);
  window.dispatchEvent(new CustomEvent("frakktur:auth-updated", { detail: user }));
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAuthToken();
  if (!token || isLegacyLocalToken(token) || isJwtExpired(token)) {
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const isAuthenticated = () => Boolean(getAuthToken() && getStoredUser());

export const registerUser = async (input: { fullName: string; email: string; password: string }) => {
  const response = (await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })) as Partial<AuthApiResponse>;

  if (!response?.token || !response?.user) {
    throw new Error("Registration failed: backend auth response is invalid.");
  }

  commitSession(response.user, response.token);
  return response;
};

export const loginUser = async (input: { email: string; password: string }) => {
  const response = (await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })) as Partial<AuthApiResponse>;

  if (!response?.token || !response?.user) {
    throw new Error("Login failed: backend auth response is invalid.");
  }

  commitSession(response.user, response.token);
  return response;
};

export const logoutUser = () => {
  setAuthToken(null);
  setStoredUser(null);
  window.dispatchEvent(new CustomEvent("frakktur:auth-updated", { detail: null }));
};

export const fetchCurrentUser = async () => {
  try {
    const response = await apiFetch("/api/auth/me");
    setStoredUser(response.user);
    return response.user as AuthUser;
  } catch (error) {
    setAuthToken(null);
    setStoredUser(null);
    throw error;
  }
};
