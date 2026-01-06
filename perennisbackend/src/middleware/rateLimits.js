// src/middleware/rateLimits.js
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
});
