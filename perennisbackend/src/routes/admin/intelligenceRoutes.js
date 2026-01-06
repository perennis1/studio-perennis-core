// perennisbackend/src/routes/admin/intelligenceRoutes.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";
import { logAdminAction } from "../../lib/audit/adminAudit.js";
import { getCrossSurfaceProfile } from "../../lib/learning/crossSurfaceAnalysis.js";
const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/lessons/:lessonId", async (req, res) => {
  const adminId = req.user.id;
  const lessonId = Number(req.params.lessonId);

  await logAdminAction({
    adminId,
    action: "INTELLIGENCE_VIEW",
    entityType: "LESSON",
    entityId: lessonId,
  });

  const signals = await prisma.lessonEngagementSignal.findMany({
    where: { lessonId },
  });

  const reflections = await prisma.reflection.findMany({
    where: { lessonId },
    select: {
      contentLength: true,
      revisionCount: true,
      latencySec: true,
      qualityHint: true,
    },
  });

  res.json({
    engagement: aggregateNumeric(signals, [
      "watchRatio",
      "completionConfidence",
      "rewatchIntensity",
      "timelineUsageRate",
    ]),
    reflections: aggregateReflection(reflections),
    sampleSize: signals.length,
  });
});

router.get("/books/:bookId", async (req, res) => {
  const adminId = req.user.id;
  const bookId = Number(req.params.bookId);

  await logAdminAction({
    adminId,
    action: "INTELLIGENCE_VIEW",
    entityType: "BOOK",
    entityId: bookId,
  });

  const signals = await prisma.bookReadingSignal.findMany({
    where: { bookId },
  });

  res.json({
    aggregates: {
      avgSessionDepth: avg(signals.map(s => s.avgSessionDepth)),
      avgGateFriction: avg(signals.map(s => s.gateFriction)),
      avgReflectionDensity: avg(signals.map(s => s.reflectionDensity)),
    },
    sampleSize: signals.length,
  });
});



router.get("/users/:userId/cross-surface", async (req, res) => {
  const adminId = req.user.id;
  const userId = Number(req.params.userId);

  await logAdminAction({
    adminId,
    action: "INTELLIGENCE_VIEW",
    entityType: "USER",
    entityId: userId,
  });

  const profile = await getCrossSurfaceProfile(userId);
  res.json(profile);
});

router.get("/curriculum", async (req, res) => {
  const adminId = req.user.id;
  const { type, id } = req.query;

  if (!type || !id) {
    return res.status(400).json({ error: "Missing curriculum params" });
  }

  await logAdminAction({
    adminId,
    action: "INTELLIGENCE_VIEW",
    entityType: "CURRICULUM",
    entityId: Number(id),
    payload: { type },
  });

  const nodes = await prisma.curriculumSignal.findMany({
    where: {
      curriculumType: type,
      curriculumId: Number(id),
    },
    orderBy: { nodeIndex: "asc" },
  });

  res.json({ nodes });
});


export default router;

/* ---------- helpers ---------- */

function aggregateNumeric(rows, fields) {
  const out = {};
  for (const f of fields) {
    const vals = rows.map(r => r[f]).filter(v => typeof v === "number");
    out[f] = summarize(vals);
  }
  return out;
}

function aggregateReflection(rows) {
  return {
    avgLength: avg(rows.map(r => r.contentLength)),
    avgLatencySec: avg(rows.map(r => r.latencySec)),
    revisionRate:
      rows.filter(r => r.revisionCount > 0).length / Math.max(1, rows.length),
    qualityDistribution: countBy(rows, "qualityHint"),
  };
}

function summarize(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    avg: avg(arr),
    median: sorted[Math.floor(sorted.length / 2)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function avg(arr) {
  const v = arr.filter(x => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function countBy(rows, key) {
  return rows.reduce((acc, r) => {
    const k = r[key] || "UNKNOWN";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
