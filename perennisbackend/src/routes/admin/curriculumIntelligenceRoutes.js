import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/admin/intelligence/curriculum
 * Query params:
 *  - type=COURSE | BOOK
 *  - id=<curriculumId>
 */
router.get(
  "/curriculum",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const { type, id } = req.query;

    if (!type || !id) {
      return res.status(400).json({
        error: "type and id are required",
      });
    }

    const curriculumType = String(type).toUpperCase();
    const curriculumId = Number(id);

    if (!["COURSE", "BOOK"].includes(curriculumType) || !curriculumId) {
      return res.status(400).json({
        error: "Invalid curriculum query",
      });
    }

    const signals = await prisma.curriculumSignal.findMany({
      where: {
        curriculumType,
        curriculumId,
      },
      orderBy: {
        nodeIndex: "asc",
      },
    });

    res.json({
      curriculumType,
      curriculumId,
      nodes: signals,
      sampleSize: signals.length,
    });
  }
);

export default router;
