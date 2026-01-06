//routes/dashboardRoutes.js


import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard/courses", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const accesses = await prisma.userCourseAccess.findMany({
      where: { userId },
      include: { course: true },
    });

    res.json(accesses.map(ua => ua.course));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve courses" });
  }
});

export default router;
