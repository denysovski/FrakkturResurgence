import { apiFetch, setAuthToken, getAuthToken } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  status: "active" | "inactive";
};

const USER_KEY = "frakktur_auth_user";
const LOCAL_USERS_KEY = "frakktur_local_auth_users";

type LocalAuthUser = {
  id: number;
  email: string;
  fullName: string;
  password: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readLocalUsers = (): LocalAuthUser[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(LOCAL_USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalAuthUser[]) : [];
  } catch {
    return [];
  }
};

const writeLocalUsers = (users: LocalAuthUser[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const commitSession = (user: AuthUser, token: string) => {
  setAuthToken(token);
  setStoredUser(user);
  window.dispatchEvent(new CustomEvent("frakktur:auth-updated", { detail: user }));
};

const shouldUseLocalFallback = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("request failed")
  );
};

const registerLocalUser = (input: { fullName: string; email: string; password: string }) => {
  const users = readLocalUsers();
  const email = normalizeEmail(input.email);

  if (users.some((user) => normalizeEmail(user.email) === email)) {
    throw new Error("Email is already registered.");
  }

  const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  const localUser: LocalAuthUser = {
    id: nextId,
    email,
    fullName: input.fullName.trim(),
    password: input.password,
  };

  users.push(localUser);
  writeLocalUsers(users);

  const user: AuthUser = {
    id: localUser.id,
    email: localUser.email,
    fullName: localUser.fullName,
    status: "active",
  };

  const token = `local-auth-${localUser.id}`;
  commitSession(user, token);
  return { message: "Account created successfully.", token, user };
};

const loginLocalUser = (input: { email: string; password: string }) => {
  const email = normalizeEmail(input.email);
  const users = readLocalUsers();
  const matched = users.find((user) => normalizeEmail(user.email) === email);

  if (!matched || matched.password !== input.password) {
    throw new Error("Invalid email or password.");
  }

  const user: AuthUser = {
    id: matched.id,
    email: matched.email,
    fullName: matched.fullName,
    status: "active",
  };

  const token = `local-auth-${matched.id}`;
  commitSession(user, token);
  return { token, user };
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
  try {
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });

    commitSession(response.user, response.token);
    return response;
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    return registerLocalUser(input);
  }
};

export const loginUser = async (input: { email: string; password: string }) => {
  try {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });

    commitSession(response.user, response.token);
    return response;
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    return loginLocalUser(input);
  }
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
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    const stored = getStoredUser();
    if (!stored) {
      throw new Error("Unauthorized");
    }

    return stored;
  }
};
