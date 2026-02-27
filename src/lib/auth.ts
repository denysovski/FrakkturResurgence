export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  status: "active" | "inactive";
  isAdmin: boolean;
};

const USER_KEY = "frakktur_auth_user";

type AuthApiResponse = {
  user: AuthUser;
  error?: string;
};

const getAuthEndpoint = (action: "register" | "login" | "logout" | "me") => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}auth.php?action=${action}`;
};
const commitSession = (user: AuthUser) => {
  setStoredUser(user);
  window.dispatchEvent(new CustomEvent("frakktur:auth-updated", { detail: user }));
};

const authRequest = async (action: "register" | "login" | "logout" | "me", body?: unknown) => {
  const method = action === "me" ? "GET" : "POST";
  const response = await fetch(getAuthEndpoint(action), {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as Partial<AuthApiResponse>;
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `Request failed (${response.status})`);
  }

  return data;
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
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof parsed?.id !== "number" ||
      typeof parsed?.email !== "string" ||
      typeof parsed?.fullName !== "string" ||
      (parsed?.status !== "active" && parsed?.status !== "inactive")
    ) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      fullName: parsed.fullName,
      status: parsed.status,
      isAdmin: parsed.isAdmin === true,
    };
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

export const isAuthenticated = () => Boolean(getStoredUser());

export const registerUser = async (input: { fullName: string; email: string; password: string }) => {
  const response = (await authRequest("register", input)) as Partial<AuthApiResponse>;

  if (!response?.user) {
    throw new Error("Registration failed.");
  }

  commitSession(response.user);
  return response;
};

export const loginUser = async (input: { email: string; password: string }) => {
  const response = (await authRequest("login", input)) as Partial<AuthApiResponse>;

  if (!response?.user) {
    throw new Error("Login failed.");
  }

  commitSession(response.user);
  return response;
};

export const logoutUser = () => {
  void authRequest("logout").catch(() => undefined);
  setStoredUser(null);
  window.dispatchEvent(new CustomEvent("frakktur:auth-updated", { detail: null }));
};

export const fetchCurrentUser = async () => {
  try {
    const response = (await authRequest("me")) as Partial<AuthApiResponse>;
    if (!response.user) {
      throw new Error("Unauthorized");
    }
    setStoredUser(response.user);
    return response.user;
  } catch (error) {
    setStoredUser(null);
    throw error;
  }
};
