import { apiFetch, setAuthToken, getAuthToken } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  status: "active" | "inactive";
};

const USER_KEY = "frakktur_auth_user";

const commitSession = (user: AuthUser, token: string) => {
  setAuthToken(token);
  setStoredUser(user);
  window.dispatchEvent(new CustomEvent("frakktur:auth-updated", { detail: user }));
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
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
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  commitSession(response.user, response.token);
  return response;
};

export const loginUser = async (input: { email: string; password: string }) => {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

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
