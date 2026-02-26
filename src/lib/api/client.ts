const configuredApiBase = import.meta.env.VITE_API_URL?.trim();

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`);

const normalizeConfiguredBaseCandidates = (value: string) => {
  const normalized = stripTrailingSlash(value);
  const withoutApiSuffix = normalized.replace(/\/api(?:\/index\.php)?$/i, "");
  return [...new Set([normalized, withoutApiSuffix].filter(Boolean))];
};

const joinBaseAndPath = (base: string, path: string) => {
  const normalizedBase = stripTrailingSlash(base);
  const normalizedPath = ensureLeadingSlash(path);

  if (/\/api\/index\.php$/i.test(normalizedBase) && normalizedPath.startsWith("/api/")) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }

  if (/\/api$/i.test(normalizedBase) && normalizedPath.startsWith("/api/")) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }

  return `${normalizedBase}${normalizedPath}`;
};

const getCandidateApiBases = () => {
  if (configuredApiBase) {
    return normalizeConfiguredBaseCandidates(configuredApiBase);
  }

  if (import.meta.env.DEV) {
    return [""];
  }

  if (typeof window === "undefined") {
    return [""];
  }

  const origin = window.location.origin;
  const basePath = stripTrailingSlash(import.meta.env.BASE_URL || "/");

  const candidates = [
    `${origin}${basePath === "" ? "" : basePath}`,
    origin,
  ];

  return [...new Set(candidates.map((item) => stripTrailingSlash(item)))];
};

const API_BASE_CANDIDATES = getCandidateApiBases();

export const getApiBaseUrl = () => API_BASE_CANDIDATES[0] || "";

const buildRequestUrls = (base: string, path: string) => {
  const urls = [joinBaseAndPath(base, path)];

  if (path.startsWith("/api/") && !path.startsWith("/api/index.php/")) {
    urls.push(joinBaseAndPath(base, path.replace("/api/", "/api/index.php/")));
  }

  return [...new Set(urls)];
};

export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("frakktur_auth_token");
};

export const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    localStorage.removeItem("frakktur_auth_token");
    return;
  }

  localStorage.setItem("frakktur_auth_token", token);
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const normalizedPath = ensureLeadingSlash(path);
  let lastError: Error | null = null;

  for (const base of API_BASE_CANDIDATES) {
    const candidateUrls = buildRequestUrls(base, normalizedPath);

    for (const requestUrl of candidateUrls) {
      try {
        const response = await fetch(requestUrl, {
          ...options,
          headers,
          credentials: "include",
        });

        const contentType = response.headers.get("content-type") || "";
        const isJsonResponse = contentType.toLowerCase().includes("application/json");
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          if (!isJsonResponse) {
            throw new Error("API returned non-JSON response. Check backend URL/proxy configuration.");
          }
          return data;
        }

        const message = typeof data?.error === "string"
          ? data.error
          : response.status === 404
            ? "API endpoint not found. Check VITE_API_URL/backend route configuration."
            : `Request failed (${response.status})`;

        const isLastUrl = requestUrl === candidateUrls[candidateUrls.length - 1];
        const isLastBase = base === API_BASE_CANDIDATES[API_BASE_CANDIDATES.length - 1];
        if (response.status === 404 && (!isLastUrl || !isLastBase)) {
          lastError = new Error(message);
          continue;
        }

        throw new Error(message);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Request failed");
        const isLastUrl = requestUrl === candidateUrls[candidateUrls.length - 1];
        const isLastBase = base === API_BASE_CANDIDATES[API_BASE_CANDIDATES.length - 1];
        if (isLastUrl && isLastBase) {
          throw lastError;
        }
      }
    }
  }

  throw lastError || new Error("Request failed");
};
