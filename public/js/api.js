async function getCsrf() {
  const r = await fetch("/api/auth/csrf-token", { credentials: "same-origin" });
  const { csrfToken } = await r.json();
  return csrfToken;
}

async function api(method, url, body) {
  const headers = { "Content-Type": "application/json" };
  if (method !== "GET") headers["X-CSRF-Token"] = await getCsrf();
  const resp = await fetch(url, {
    method,
    headers,
    credentials: "same-origin",
    body: method === "GET" ? undefined : JSON.stringify(body || {}),
  });
  if (!resp.ok)
    throw await resp.json().catch(() => ({ message: resp.statusText }));
  return resp.json().catch(() => ({}));
}
