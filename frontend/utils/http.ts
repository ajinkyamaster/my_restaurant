const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Kept in memory only: never localStorage, so injected scripts cannot read it
// from storage. It is re-fetched from the API after a reload.
let csrfToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

function rememberToken(res: Response) {
  const token = res.headers.get("X-CSRF-Token");
  if (token) csrfToken = token;
}

async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${BASE}/api/csrf`, { credentials: "include" });
  rememberToken(res);
  return csrfToken;
}

/** Single-flight: concurrent 401s share one refresh request. */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const token = await ensureCsrfToken();
      const res = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: token ? { "X-CSRF-Token": token } : {},
      });
      rememberToken(res);
      return res.ok;
    })()
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request(
  base: string,
  endpoint: string,
  options: RequestInit = {},
  retried = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const method = (options.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string> | undefined) || {}),
  };

  if (options.body) headers["Content-Type"] = "application/json";
  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(`${BASE}${base}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });
  rememberToken(res);

  const isStaffArea = base.startsWith("/api/admin") || base.startsWith("/api/manager");

  // An expired 15-minute access token is refreshed once, transparently.
  if (res.status === 401 && !retried && isStaffArea && !endpoint.startsWith("/login")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request(base, endpoint, options, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export { BASE };
