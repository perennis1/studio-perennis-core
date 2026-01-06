//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\cohortRoutes.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.post("/cohorts", async (req, res) => {
  const { name, description } = req.body;
  const cohort = await prisma.cohort.create({ data: { name, description } });
  res.json(cohort);
});

router.post("/cohorts/:id/users", async (req, res) => {
  await prisma.user.update({
    where: { id: req.body.userId },
    data: { cohortId: Number(req.params.id) },
  });
  res.json({ success: true });
});

export default router;
