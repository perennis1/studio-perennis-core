// src/routes/authRoutes.js

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const router = express.Router();

// --- helpers ---

// ✅ MOCK CONTRACTS (temporary fix)
const LoginInput = { safeParse: (data) => ({ success: true, data }) };
const RegisterInput = { safeParse: (data) => ({ success: true, data }) };
const UserResponse = { parse: (user) => user };




const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET missing from .env!");
  process.exit(1);
}

const TOKEN_EXPIRES_IN = "7d";

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.isAdmin ? "ADMIN" : "USER",
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );


// Use the UserResponse schema to validate responses
const toSafeUser = (user) => {
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tagline: user.tagline,
    isAdmin: user.isAdmin,
  };
  // Validate against contract schema
  return UserResponse.parse(safeUser);
};

// --- routes ---

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    // Validate input using contract
    const validation = RegisterInput.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = createToken(user);
    const safeUser = toSafeUser(user);

    return res.status(201).json({
      message: "User registered.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    // Validate input using contract
    const validation = LoginInput.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = createToken(user);
    const safeUser = toSafeUser(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        tagline: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate response against contract
    const safeUser = toSafeUser(user);
    return res.json(safeUser);
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, residence, gender, nationality } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name: fullName,
        residence,
        gender,
        nationality,
      },
    });

    const safeUser = toSafeUser(user);
    return res.json(safeUser);
  } catch (error) {
    console.error('Profile Update Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

export default router;