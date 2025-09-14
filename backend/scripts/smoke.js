// scripts/smoke.js
/* Node 18+ (has fetch). Writes smoke-report.json */
const fs = require("fs");

const API_BASE = process.env.API_BASE || "http://localhost:3001";

async function main() {
  const report = { startedAt: new Date().toISOString(), API_BASE, steps: [] };
  let cookie = ""; // will hold the auth cookie

  async function step(name, fn) {
    const entry = { name, ok: false, status: null, detail: null };
    report.steps.push(entry);
    try {
      const res = await fn();
      entry.ok = res.okExpected ?? (res.status && res.status < 400);
      entry.status = res.status ?? null;
      entry.detail = res.detail ?? null;
      if (!entry.ok) throw new Error(`${name} failed`);
      console.log(`✔ ${name}`);
    } catch (e) {
      console.error(`✖ ${name}:`, e.message);
      entry.detail = entry.detail || e.message;
      entry.ok = false;
    }
  }

  function parseSetCookie(headers) {
    const set = headers.get("set-cookie");
    if (!set) return "";
    // use everything up to first ';'
    return set.split(";")[0]; // e.g., sid=eyJhbGciOi...
  }

  const unauth = await fetch(`${API_BASE}/api/products`, {
    redirect: "manual",
  });
  await step("unauthorized /api/products returns 401", async () => ({
    status: unauth.status,
    okExpected: unauth.status === 401,
    detail: `status=${unauth.status}`,
  }));

  await step("login admin/password", async () => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "admin", password: "password" }),
    });
    cookie = parseSetCookie(res.headers);
    const body = await res.json().catch(() => ({}));
    return {
      status: res.status,
      detail: { cookie: !!cookie, user: body.user?.empUsername },
    };
  });

  await step("GET /api/auth/me", async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Cookie: cookie },
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, detail: body };
  });

  // suppliers list
  await step("GET /api/suppliers", async () => {
    const res = await fetch(`${API_BASE}/api/suppliers`, {
      headers: { Cookie: cookie },
    });
    const body = await res.json().catch(() => ({}));
    return {
      status: res.status,
      detail: {
        totalRecords: body.totalRecords,
        currentPage: body.currentPage,
      },
    };
  });

  // create supplier
  let supID = null;
  await step("POST /api/suppliers (create)", async () => {
    const res = await fetch(`${API_BASE}/api/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        supName: "Smoke Supplier",
        supContactName: "QA Bot",
        supContactEmail: "qa@example.com",
        supContactPhone: "5551234567",
        supAddress: "1 Test St",
        supCity: "Testville",
        supCountry: "USA",
      }),
    });
    const body = await res.json().catch(() => ({}));
    supID = body.supID;
    return { status: res.status, detail: { supID } };
  });

  // create product
  let prodID = null;
  await step("POST /api/products (create)", async () => {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        prodName: "Smoke Widget",
        prodCategory: "QA",
        supID,
      }),
    });
    const body = await res.json().catch(() => ({}));
    prodID = body.prodID;
    return { status: res.status, detail: { prodID } };
  });

  // update product
  await step("PUT /api/products/:id (update)", async () => {
    const res = await fetch(`${API_BASE}/api/products/${prodID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ prodCategory: "QA-Updated" }),
    });
    const body = await res.json().catch(() => ({}));
    return {
      status: res.status,
      detail: { prodID: body.prodID, prodCategory: body.prodCategory },
    };
  });

  // delete product
  await step("DELETE /api/products/:id", async () => {
    const res = await fetch(`${API_BASE}/api/products/${prodID}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, detail: body };
  });

  // delete supplier
  await step("DELETE /api/suppliers/:id", async () => {
    const res = await fetch(`${API_BASE}/api/suppliers/${supID}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, detail: body };
  });

  // paged products
  await step("GET /api/products?page=1&limit=2", async () => {
    const res = await fetch(`${API_BASE}/api/products?page=1&limit=2`, {
      headers: { Cookie: cookie },
    });
    const body = await res.json().catch(() => ({}));
    return {
      status: res.status,
      detail: {
        page: body.currentPage,
        items: body.items?.length,
        totalPages: body.totalPages,
      },
    };
  });

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync("smoke-report.json", JSON.stringify(report, null, 2));
  const failed = report.steps.filter((s) => !s.ok).length;
  console.log(`\nSmoke complete. Failed: ${failed}. Report: smoke-report.json`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("Smoke crashed", e);
  process.exit(1);
});
