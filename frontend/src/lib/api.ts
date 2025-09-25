const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function api<T = unknown>(
  path: string,
  opts: RequestInit = {},
  asJson = true
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const method = (opts.method || "GET").toUpperCase();

  // Build headers without forcing preflight on GET/HEAD
  const headers = new Headers(opts.headers || {});
  if (method !== "GET" && method !== "HEAD") {
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
  }

  try {
    const resp = await fetch(url, {
      credentials: "include", // keep if your API uses cookies; remove if not needed
      ...opts,
      method,
      headers,
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => resp.statusText);
      throw new Error(`${resp.status} ${msg || resp.statusText}`);
    }

    if (!asJson) {
      return resp as unknown as T;
    }

    // 204/empty body safe handling
    if (resp.status === 204) return undefined as T;

    const text = await resp.text();
    if (!text) return undefined as T; // nothing to parse
    return JSON.parse(text) as T;
  } catch (err: any) {
    // Ignore aborts (StrictMode effect cleanup)
    if (
      err?.name === "AbortError" ||
      String(err?.message).includes("aborted")
    ) {
      return undefined as T;
    }
    throw err;
  }
}

export function getJson<T = unknown>(path: string, init: RequestInit = {}) {
  return api<T>(path, { ...init, method: "GET" });
}
