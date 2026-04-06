/**
 * MIDDLEWARES — Global middleware stack
 */

function requestLogger(req, _res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}

function apiKeyAuth(req, res, next) {
  const key = req.headers["x-api-key"];
  const expected = process.env.API_KEY;

  // If no API_KEY env var is set, skip auth (development mode)
  if (!expected) return next();

  if (!key || key !== expected) {
    return res.status(401).json({ success: false, message: "API key inválida ou ausente." });
  }
  next();
}

function paginationDefaults(req, _res, next) {
  req.query.page = parseInt(req.query.page, 10) || 1;
  req.query.limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  next();
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor.",
  });
}

module.exports = { requestLogger, apiKeyAuth, paginationDefaults, errorHandler };
