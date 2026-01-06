// src/routes/courseRoutes.js
import express from "express";
import prisma from "../lib/prisma.js";
import {
  verifyToken,
  verifyTokenStandalone,
} from "../middleware/authMiddleware.js";
import { createCheckoutSession } from "../services/paymentService.js";
import {
  canAccessCourse,
  canAccessLesson,
  hasValidReflection,
} from "../lib/accessControl.js";
import { YoutubeTranscript } from "youtube-transcript";
import { emitLearningEvent } from "../lib/learning/emitLearningEvent.js";



const router = express.Router();

/* ---------------- HELPERS ---------------- */

function extractYouTubeId(url) {
  const short = url.match(/youtu\.be\/([^?]+)/);
  if (short) return short[1];
  const long = url.match(/[?&]v=([^&]+)/);
  if (long) return long[1];
  return url;
}










/* ---------------- PUBLIC COURSES ---------------- */



// GET /api/courses
router.get("/courses", async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { lessons: true } } },
    });

    res.json(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        level: c.level,
        durationMin: c.durationMin,
        lessonsCount: c._count.lessons,
      }))
    );
  } catch (err) {
    console.error("GET /courses error", err);
    res.status(500).json({ message: "Failed to load courses" });
  }
});

// GET /api/courses/slug/:slug
router.get("/courses/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const authHeader = req.headers.authorization;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    if (!course || course.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Course not found" });
    }

    let hasAccess = false;
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        user = verifyTokenStandalone(token);
        hasAccess = await canAccessCourse(user.id, course.id);
      } catch {}
    }

    const lessons = course.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      order: l.order,
      isPreview: l.isPreview,
      locked: !l.isPreview && !hasAccess,
    }));

    res.json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      summary: course.summary,
      level: course.level,
      hasAccess,
      lessons,
    });
  } catch (err) {
    console.error("GET course error:", err);
    res.status(500).json({ message: "Failed to load course" });
  }
});

/* ---------------- CHECKOUT ---------------- */

router.post("/courses/:courseId/checkout", verifyToken, async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: userId, email } = req.user;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Course not found" });
    }

    const urlOrOrder = await createCheckoutSession(
      userId,
      courseId,
      email,
      course.slug
    );

    res.json({ urlOrOrder });
  } catch (err) {
    console.error("Checkout error", err);
    res.status(500).json({ message: "Checkout failed" });
  }
});

/* ---------------- USER PROGRESS ---------------- */

// POST /api/courses/:courseId/lessons/:lessonId/complete
router.post(
  "/courses/:courseId/lessons/:lessonId/complete",
  verifyToken,
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      const lessonId = Number(req.params.lessonId);
      const userId = req.user.id;

      /* -------- HARD ACCESS GATE (PHASE 6D) -------- */
const canAccess = await canAccessLesson(userId, lessonId);
if (!canAccess) {
  return res.status(403).json({ error: "ACCESS_DENIED" });
}

const hasReflection = await hasValidReflection(userId, lessonId);
if (!hasReflection) {
  return res.status(409).json({ error: "REFLECTION_REQUIRED" });
}

const reflected = await hasValidReflection(userId, lessonId);
if (!reflected) {
  return res.status(409).json({
    error: "REFLECTION_REQUIRED",
    message: "Reflection required before completion",
  });
}


      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, courseId },
      });
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      let enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: { userId, courseId, progress: 0 },
        });
      }

      const existing = await prisma.lessonEnrollment.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });
      const wasCompleted = existing?.completed === true;

      await prisma.lessonEnrollment.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, lessonId, courseId, completed: true },
      });

      const totalLessons = await prisma.lesson.count({ where: { courseId } });
      const completedLessons = await prisma.lessonEnrollment.count({
        where: { userId, courseId, completed: true },
      });

      const progress =
        totalLessons > 0 ? completedLessons / totalLessons : 0;

      const updatedEnrollment = await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: { progress },
        include: {
          completedLessons: {
            where: { completed: true },
            select: { lessonId: true },
          },
        },
      });

      if (!wasCompleted) {
        const XP_PER_LESSON = 10;
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true },
        });

        if (user) {
          const newXp = user.xp + XP_PER_LESSON;
          const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

          await prisma.user.update({
            where: { id: userId },
            data: { xp: newXp, level: newLevel },
          });
        }
      }

      await prisma.userActivity.create({
        data: { userId, type: "lesson_completed", lessonId },
      });

await emitLearningEvent({
  userId,
  surfaceType: "LESSON",
  surfaceId: lessonId,
  eventType: "LESSON_COMPLETE",
});

      res.json({
        progress: updatedEnrollment.progress,
        completedLessons: updatedEnrollment.completedLessons.map(
          (l) => l.lessonId
        ),
      });
    } catch (err) {
      console.error("Complete lesson error", err);
      res.status(500).json({ message: "Failed to mark complete" });
    }
  }
);





/* ---------------- COMMENTS ---------------- */

// GET comments
router.get("/courses/lessons/:lessonId/comments", async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);

    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        currentUserId = verifyTokenStandalone(token).id;
      } catch {}
    }

    const comments = await prisma.comment.findMany({
      where: {
        targetType: "lesson",
        targetId: lessonId,
        status: "visible",
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        reactions: currentUserId
          ? {
              where: { userId: currentUserId, type: "like" },
              select: { id: true },
            }
          : false,
      },
    });

    res.json(
      comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        content: c.content,
        createdAt: c.createdAt,
        parentId: c.parentId,
        likeCount: c.likeCount,
        pinned: c.pinned,
        gifUrl: c.gifUrl,
        user: c.user,
        likedByMe: currentUserId
          ? (c.reactions?.length ?? 0) > 0
          : false,
      }))
    );
  } catch (err) {
    console.error("GET comments error", err);
    res.status(500).json({ message: "Failed to load comments" });
  }
});

// POST comment
router.post(
  "/courses/lessons/:lessonId/comments",
  verifyToken,
  async (req, res) => {
    try {
      const lessonId = Number(req.params.lessonId);
      const userId = req.user.id;
      const { content, parentId, gifUrl } = req.body;

      if (!content && !gifUrl) {
        return res.status(400).json({ message: "Content or GIF required" });
      }

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const comment = await prisma.comment.create({
        data: {
          targetType: "lesson",
          targetId: lessonId,
          userId,
          parentId: parentId || null,
          content: content || "",
          gifUrl: gifUrl || null,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      await prisma.userActivity.create({
        data: { userId, type: "comment_posted", lessonId },
      });

      res.status(201).json(comment);
    } catch (err) {
      console.error("POST comment error", err);
      res.status(500).json({ message: "Failed to add comment" });
    }
  }
);

export default router;
