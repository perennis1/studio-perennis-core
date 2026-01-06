
//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\curriculumRoutes.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.post("/curriculum/step", async (req, res) => {
  const { cohortId, order, type, refId } = req.body;
  if (!order || !type || !refId) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  res.json(
    await prisma.curriculumStep.create({
      data: { cohortId: cohortId ?? null, order, type, refId },
    })
  );
});

router.patch("/curriculum/steps/:id/disable", async (req, res) => {
  res.json(
    await prisma.curriculumStep.update({
      where: { id: req.params.id },
      data: { active: false },
    })
  );
});

router.get("/:bookId", async (_req, res) => {
  res.json({
    steps: await prisma.curriculumStep.findMany({
      where: { refId: { not: null } },
      orderBy: { order: "asc" },
    }),
  });
});

router.post("/:bookId/steps", async (req, res) => {
  res.json(await prisma.curriculumStep.create({ data: req.body }));
});

router.put("/steps/:stepId", async (req, res) => {
  res.json(
    await prisma.curriculumStep.update({
      where: { id: req.params.stepId },
      data: req.body,
    })
  );
});

router.delete("/steps/:stepId", async (req, res) => {
  await prisma.curriculumStep.delete({ where: { id: req.params.stepId } });
  res.json({ success: true });
});

export default router;
