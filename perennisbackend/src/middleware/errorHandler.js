// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error("❌ SERVER ERROR", {
      path: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: err.message || "Internal server error",
  });
}
