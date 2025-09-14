const { JWT_COOKIE_NAME, NODE_ENV } = require("../config/env");
const AuthService = require("../services/AuthService");

function normalizeLoginInput(body = {}) {
  const id =
    body.usernameOrEmail ??
    body.username ??
    body.empUsername ??
    body.email ??
    body.empEmail ??
    "";
  const pwd = body.password ?? body.empPassword ?? "";

  const usernameOrEmail = String(id || "").trim();
  const password = String(pwd || "").trim();

  return { usernameOrEmail, password };
}

exports.login = async (req, res) => {
  const { usernameOrEmail, password } = normalizeLoginInput(req.body);

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const result = await AuthService.login({ usernameOrEmail, password });
    if (!result) return res.status(401).json({ error: "Invalid credentials" });

    const isProd = NODE_ENV === "production";
    res.cookie(JWT_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8h
      path: "/",
    });

    return res.json({ user: result.user });
  } catch (err) {
    console.error("Auth login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.me = (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ user: req.user });
};

exports.logout = (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
};
