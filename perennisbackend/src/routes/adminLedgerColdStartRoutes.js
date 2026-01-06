// perennisbackend/src/routes/adminLedgerColdStartRoutes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { coldStartRebuild } from "../lib/ledgerColdStart.js";

const router = express.Router();

/**
 * POST /api/admin/ledger/cold-start
 * Body: { confirm: "REBUILD" }
 */
router.post("/admin/ledger/cold-start", verifyToken, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.body?.confirm !== "REBUILD") {
    return res.status(400).json({
      error: "Confirmation required: { confirm: 'REBUILD' }",
    });
  }

  try {
    await coldStartRebuild(prisma);
    res.json({ status: "REBUILD_COMPLETE" });
  } catch (err) {
    console.error("Cold-start rebuild failed:", err);
    res.status(500).json({ error: "Cold-start failed" });
  }
});

export default router;
