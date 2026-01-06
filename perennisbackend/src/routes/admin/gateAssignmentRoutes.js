//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\gateAssignmentRoutes.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.post("/gates/assign", async (req, res) => {
  const { gateId, cohortId, active } = req.body;
  if (!gateId) return res.status(400).json({ error: "gateId required" });

  res.json(
    await prisma.gateAssignment.upsert({
      where: { gateId_cohortId: { gateId, cohortId: cohortId ?? null } },
      update: { active: active ?? true },
      create: { gateId, cohortId: cohortId ?? null, active: active ?? true },
    })
  );
});

router.patch("/gates/:id/deactivate", async (req, res) => {
  res.json(
    await prisma.gateAssignment.update({
      where: { id: req.params.id },
      data: { active: false },
    })
  );
});

export default router;
