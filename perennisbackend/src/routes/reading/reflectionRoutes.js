//C:\Users\studi\my-next-app\perennisbackend\src\routes\reading\reflectionRoutes.js

import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { satisfyGate } from "../../lib/reading/reflectionGateService.js";
import { emitLearningEvent } from "../../lib/learning/emitLearningEvent.js";
import { deriveBookSessions } from "../../lib/learning/deriveBookSessions.js";
const router = express.Router();




/**
 * POST /reading/reflection
 */
router.post("/reflection", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, gateId, text } = req.body;

    if (!bookId || !gateId || !text) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    await satisfyGate({
      userId,
      bookId,
      gateId,
      answerText: text,
    });

    // 🔹 Phase 8.4.4.3 — mirror into LearningEvent
await emitLearningEvent({
  userId,
  surfaceType: "BOOK",
  surfaceId: bookId,
  eventType: "BOOK_REFLECTION_SUBMITTED",
  metadata: {
    gateId,
    length: text.length,
  },
});
await deriveBookSessions({ userId, bookId });


    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
