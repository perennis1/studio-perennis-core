
//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\dashboardRoutes.js
import express from "express";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { getAdminDashboardSnapshot } from "../../lib/analytics/adminDashboardService.js";
import { AdminDashboardDTO } from "../../dto/admin/AdminDashboardDTO.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/", async (_req, res, next) => {
  try {
    const snapshot = await getAdminDashboardSnapshot();
    res.json(AdminDashboardDTO.from(snapshot));
  } catch (err) {
    next(err);
  }
});

export default router;
