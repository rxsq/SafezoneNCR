require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { sequelize } = require("./src/db");
const errorHandler = require("./src/middleware/errorHandler");
const routes = require("./src/routes");
const { swaggerSpec } = require("./swagger");

const app = express();

const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3002";

// Expose raw OpenAPI JSON
app.get("/openapi.json", (req, res) => {
  res.type("application/json").send(swaggerSpec);
});

// Standard middleware
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API routes
app.use("/api", routes);

(async () => {
  try {
    // Import the ESM-only Scalar middleware dynamically
    const { apiReference } = await import("@scalar/express-api-reference");

    // Relax CSP for /reference so Scalar UI scripts can run
    const scalarCsp = helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "cdn.jsdelivr.net",
          "unpkg.com",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "unpkg.com",
          "fonts.googleapis.com",
        ],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "data:", "fonts.gstatic.com"],
        "connect-src": ["'self'", "http:", "https:"],
        "worker-src": ["'self'", "blob:"],
        "frame-ancestors": ["'self'"],
      },
    });

    // Mount Scalar UI
    app.use(
      "/reference",
      scalarCsp,
      helmet.crossOriginEmbedderPolicy({ policy: "unsafe-none" }),
      helmet.crossOriginOpenerPolicy({ policy: "same-origin-allow-popups" }),
      apiReference({
        url: "/openapi.json",
      })
    );

    // 404 handler (keep AFTER Scalar mount)
    app.use((req, res) => res.status(404).json({ error: "Not Found" }));

    // Error handler
    app.use(errorHandler);

    // DB + server startup
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`API:   http://localhost:${PORT}`);
      console.log(`Docs:  http://localhost:${PORT}/reference`);
      console.log(`Spec:  http://localhost:${PORT}/openapi.json`);
    });
  } catch (e) {
    console.error("Startup failed:", e);
    process.exit(1);
  }
})();
