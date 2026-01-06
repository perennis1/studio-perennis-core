import rateLimit from "express-rate-limit";

export const intelligenceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // hard cap
  standardHeaders: true,
  legacyHeaders: false,
});
