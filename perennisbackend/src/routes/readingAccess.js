// perennisbackend/src/routes/readingAccess.js

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import { checkPageAccess } from "../lib/reading/reflectionGateService.js";

const router = express.Router();

/**
 * POST /api/reading/access
 *
 * Body:
 * {
 *   bookId: number,
 *   pageNumber: number
 * }
 */
router.post("/access", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, pageNumber } = req.body;

    if (!bookId || !pageNumber) {
      return res.status(400).json({
        allowed: false,
        reason: "INVALID_REQUEST",
      });
    }

    const access = await checkPageAccess({
      userId,
      bookId: Number(bookId),
      pageNumber: Number(pageNumber),
    });

    return res.json(access);
  } catch (err) {
    console.error("reading/access error", err);
    return res.status(500).json({
      allowed: false,
      reason: "INTERNAL_ERROR",
    });
  }
});

export default router;
