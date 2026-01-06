//C:\Users\studi\my-next-app\perennisbackend\src\controllers\authController.js

import prisma from "../lib/prisma.js";



// POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    // sign token
    const token = signToken({ id: user.id, email: user.email,  role: user.isAdmin ? "ADMIN" : "USER", });

    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user.id, email: user.email });

    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }, token });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const me = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, name: true, avatar: true, tagline: true, createdAt: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res, next) => {
  // Stateless JWT: client should drop token. Optionally implement server-side blacklist.
  res.json({ message: "Logged out" });
};

// POST /api/auth/forgot
export const sendForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: "If that email exists, instructions were sent" });

    // create reset token (short-lived)
    const token = signToken({ id: user.id }, { expiresIn: "1h" });
    const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    // send email (best-effort)
    try {
      await sendResetEmail(email, url);
    } catch (e) {
      console.error("Mail failed", e);
    }

    res.json({ message: "If that email exists, instructions were sent" });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset/:token
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Invalid request" });

    const payload = verifyToken(token);
    if (!payload?.id) return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await hashPassword(password);
    await prisma.user.update({ where: { id: Number(payload.id) }, data: { password: hashed } });

    res.json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
};
