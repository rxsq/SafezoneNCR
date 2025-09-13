const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const csrf = require("csurf");

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

// DB
const { sequelize } = require("./db/models.js");

const app = express();

// --- security headers
app.use(helmet({ contentSecurityPolicy: false }));

// --- parsers
app.use(express.json());
app.use(cookieParser());

// --- sessions (http-only cookie)
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./" }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8h
    },
  })
);

// --- rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// --- static
app.use(express.static(path.join(__dirname, "public")));
const uploadDir = path.join(__dirname, "public/assets/data/uploads");
app.use("/assets/data/uploads", express.static(uploadDir));

// --- routes: auth first (has its own CSRF handling)
const authRoutes = require("./routes/auth");
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);

// --- global API auth + CSRF (for all non-auth API routes)
const csrfProtection = csrf({ cookie: true });

function requireAuth(req, res, next) {
  if (req.path.startsWith("/auth")) return next(); // let auth routes pass
  if (!req.session?.user)
    return res.status(401).json({ message: "Unauthorized" });
  return next();
}
app.use("/api", requireAuth, (req, res, next) => {
  if (req.method === "GET" || req.path.startsWith("/auth")) return next();
  return csrfProtection(req, res, next); // CSRF only on write ops
});

// --- role helpers
const { requireRole } = require("./utils/authz");

// --- API routers (protected)
const ncrFormsRoutes = require("./routes/ncrForms");
const productsRoutes = require("./routes/products");
const suppliersRoutes = require("./routes/suppliers");
const employeesRoutes = require("./routes/employees");
const positionsRoutes = require("./routes/positions");
const qualityFormsRoutes = require("./routes/qualityForms");
const engineerFormsRoutes = require("./routes/engineerForms");
const purchasingFormsRoutes = require("./routes/purchasingForms");
const statusRoutes = require("./routes/status");
const emailRoutes = require("./routes/emailRoutes");
const pdfRoutes = require("./routes/ncrPdfRoute.js");
const notificationsRoutes = require("./routes/notifications");
const ncrEmployeeRoutes = require("./routes/ncrEmployee");

app.use("/api/ncrForms", ncrFormsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/positions", positionsRoutes);
app.use("/api/qualityForms", qualityFormsRoutes);
app.use("/api/engineerForms", engineerFormsRoutes);
app.use("/api/purchasingForms", purchasingFormsRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/ncrPdfRoute", pdfRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/ncrEmployee", ncrEmployeeRoutes);

// --- api 404 (before html fallback)
app.use("/api", (_req, res) => res.status(404).json({ message: "Not Found" }));

// --- html fallback (last)
app.get("*", (req, res) => {
  const requestedPath = req.path === "/" ? "/login" : req.path;
  const sanitizedPath = requestedPath.replace(".html", "");
  const filePath = path.join(
    __dirname,
    "public",
    "views",
    `${sanitizedPath}.html`
  );
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send("404 Not Found");
    res.sendFile(filePath);
  });
});

// --- port fallback
function startWithFallback(app, preferredPort = 3000, maxAttempts = 20) {
  let port = Number(process.env.PORT) || preferredPort;
  let attempts = 0;

  const tryListen = () => {
    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        attempts += 1;
        if (attempts >= maxAttempts) {
          console.error(
            `All ${maxAttempts} attempts failed (last tried ${port}). Exiting.`
          );
          process.exit(1);
        }
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        port += 1;
        setTimeout(tryListen, 50);
      } else if (err.code === "EACCES") {
        console.error(`No permission to bind port ${port}. Try a higher port.`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  };

  tryListen();
}

// --- boot
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    startWithFallback(app, PORT, 50);
  } catch (e) {
    console.error("DB init failed:", e);
    process.exit(1);
  }
})();
