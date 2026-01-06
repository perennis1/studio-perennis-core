//C:\Users\studi\my-next-app\perennisbackend\src\routes\reading\pageAccessRoutes.js


import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { checkPageAccess } from "../../lib/reading/reflectionGateService.js";
import { emitLearningEvent } from "../../lib/learning/emitLearningEvent.js";


const router = express.Router();

/**
 * GET /reading/page-access?bookId=1&page=42
 */
router.get("/page-access", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = Number(req.query.bookId);
    const pageNumber = Number(req.query.page);

    if (!bookId || !pageNumber) {
      return res.status(400).json({ error: "Invalid params" });
    }

    const result = await checkPageAccess({
      userId,
      bookId,
      pageNumber,
    });

 if (!result.allowed) {
  await emitLearningEvent({
    userId,
    surfaceType: "BOOK",
    surfaceId: bookId,
    eventType: "BOOK_GATE_BLOCKED",
    position: pageNumber,
    metadata: {
      gateId: result.gate?.id ?? null,
    },
  });

  return res.status(403).json({
    locked: true,
    gate: result.gate,
  });
}


await emitLearningEvent({
  userId,
  surfaceType: "BOOK",
  surfaceId: bookId,
  eventType: "BOOK_PAGE_ACCESS",
  position: pageNumber,
});



    res.json({ allowed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
