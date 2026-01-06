// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export function verifyToken(req, res, next) {  // SYNC - TRUST JWT
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // TRUST JWT payload - NO DB QUERY
    req.user = {
  id: decoded.id,
  email: decoded.email,
  role: decoded.role,   // ← THIS WAS MISSING
};

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// NEW: Standalone version for non-middleware use (course progress)
export function verifyTokenStandalone(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}
export function verifyTokenOptional(req, _res, next) {
  const header = req.headers.authorization;
  if (!header) return next();

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }

  next();
}

// ADMIN GUARD — depends on verifyToken
export function requireAdmin(req, res, next) {
  // verifyToken must have already run
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // role must be present in JWT payload
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
}
