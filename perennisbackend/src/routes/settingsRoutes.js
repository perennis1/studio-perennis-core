// perennisbackend/src/routes/settingsRoutes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /admin/settings
router.get("/admin/settings", async (req, res) => {
  const settings =
    (await prisma.appSetting.findFirst()) ??
    (await prisma.appSetting.create({
      data: {
        siteName: "Studio Perennis",
        maintenanceMode: false,
      },
    }));

  res.json(settings);
});

// PUT /admin/settings
router.put("/admin/settings", verifyToken, async (req, res) => {
  const { siteName, maintenanceMode } = req.body;

  const existing = await prisma.appSetting.findFirst();
  if (!existing) {
    return res.status(500).json({ message: "Settings row missing" });
  }

  const updated = await prisma.appSetting.update({
    where: { id: existing.id },
    data: {
      siteName,
      maintenanceMode,
    },
  });

  res.json(updated);
});

export default router;
