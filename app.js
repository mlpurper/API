/**
 * E-Commerce Partner API
 * Architecture: REST / MVC
 * Stack: Node.js + Express
 */

const express = require("express");
const app = express();

const routes = require("./routes");
const { apiKeyAuth, errorHandler, requestLogger, paginationDefaults } = require("./middlewares");

// ── Global Middlewares ────────────────────────────────────────
app.use(express.json());
app.use(requestLogger);

// ── Health Check (sem auth) ───────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" })
);

// ── API Routes ───────────────────────────────────────────────
const API_PREFIX = "/api/v1";

app.use(API_PREFIX, apiKeyAuth);        // auth gate
app.use(API_PREFIX, paginationDefaults);
app.use(API_PREFIX, routes);

// ── 404 Fallback ─────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: "Rota não encontrada." }));

// ── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 E-Commerce Partner API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Base:   http://localhost:${PORT}${API_PREFIX}`);
});

module.exports = app;
