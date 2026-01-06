import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { getOpenInquiryThreads } from "../../lib/inquiry/inquiryQueryService.js";

const router = express.Router();

router.get("/me/inquiries", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const threads = await getOpenInquiryThreads({ userId });
  res.json(threads);
});

export default router;
