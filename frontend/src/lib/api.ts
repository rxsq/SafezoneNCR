const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function api<T = any>(
  path: string,
  opts: RequestInit = {},
  asJson = true
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const resp = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`${resp.status} ${msg}`);
  }
  if (!asJson) return (resp as unknown) as T;
  // try json, fall back to empty object
  try {
    return (await resp.json()) as T;
  } catch {
    return {} as T;
  }
}

export async function getJson<T = any>(path: string) {
  return api<T>(path, { method: "GET" });
}
