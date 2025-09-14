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

const app = express();

const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3002";

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3002",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API
app.use("/api", routes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// Errors
app.use(errorHandler);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () =>
      console.log(`API listening on http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("Startup failed:", e);
    process.exit(1);
  }
})();
