// perennisbackend/src/routes/admin/courseAdminRoutes.js
import express from "express";
import prisma from "../../lib/prisma.js";
import {
  verifyToken,
  requireAdmin,
} from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

const router = express.Router();

/* ---------------- COURSES ---------------- */

// GET /api/admin/courses
router.get(
  "/courses",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSES_LIST"),
  async (_req, res, next) => {
    try {
      const courses = await prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { lessons: true, enrollments: true },
          },
        },
      });

      res.json({
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          status: c.status,
          level: c.level,
          durationMin: c.durationMin,
          lessonsCount: c._count.lessons,
          enrollmentsCount: c._count.enrollments,
          createdAt: c.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/courses/:id/publish
router.post(
  "/courses/:id/publish",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSE_PUBLISH"),
  async (req, res, next) => {
    try {
      const courseId = Number(req.params.id);

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      const issues = await validateCourse(courseId);
      assertPublishable(course, issues);

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);
// POST /api/admin/courses/:id/validate
router.post(
  "/courses/:id/validate",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSE_VALIDATE"),
  async (req, res, next) => {
    try {
      const courseId = Number(req.params.id);
      const issues = await validateCourse(courseId);

      if (issues.length === 0) {
        await prisma.course.update({
          where: { id: courseId },
          data: { status: "READY" },
        });
      }

      res.json({ ok: issues.length === 0, issues });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/courses/:id/archive
router.post(
  "/courses/:id/archive",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSE_ARCHIVE"),
  async (req, res, next) => {
    try {
      const courseId = Number(req.params.id);

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: { status: "ARCHIVED" },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/courses
router.post(
  "/courses",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSE_CREATE"),
  async (req, res, next) => {
    try {
      const { title, slug, summary, level, durationMin, thumbnail } = req.body;

      const course = await prisma.course.create({
        data: {
          title,
          slug,
          summary,
          level,
          durationMin,
          thumbnail: thumbnail || null,
          authorId: req.user.id,
         status: "DRAFT",
        },
      });

      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/courses/:id
router.put(
  "/courses/:id",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSE_UPDATE"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { title, slug, summary, level, durationMin, thumbnail } = req.body;

      const course = await prisma.course.update({
        where: { id },
        data: {
          title,
          slug,
          summary,
          level,
          durationMin,
          thumbnail,
        },
      });

      res.json(course);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/courses/:id
router.delete(
  "/courses/:id",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_COURSE_DELETE"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const course = await prisma.course.findUnique({ where: { id } });

      assertDeletable(course);

      await prisma.course.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);


/* ---------------- LESSONS (ADMIN) ---------------- */

// GET lessons
router.get(
  "/courses/:courseId/lessons",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_LESSON_LIST"),
  async (req, res, next) => {
    try {
      const courseId = Number(req.params.courseId);
      const lessons = await prisma.lesson.findMany({
        where: { courseId },
        orderBy: { order: "asc" },
      });
      res.json(lessons);
    } catch (err) {
      next(err);
    }
  }
);

// POST lesson
router.post(
  "/courses/:courseId/lessons",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_LESSON_CREATE"),
  async (req, res, next) => {
    try {
      const courseId = Number(req.params.courseId);
      const { title, slug, body, order, videoUrl, isPreview } = req.body;

      const lesson = await prisma.lesson.create({
        data: {
          title,
          slug,
          body: body || "",
          order: Number(order) || 1,
          videoUrl: videoUrl || null,
          isPreview: !!isPreview,
          courseId,
        },
      });

      res.status(201).json(lesson);
    } catch (err) {
      next(err);
    }
  }
);

// PUT lesson
// PUT /api/admin/courses/:courseId/lessons/:lessonId
router.put(
  "/courses/:courseId/lessons/:lessonId",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_LESSON_UPDATE"),
  async (req, res, next) => {
    try {
      const lessonId = Number(req.params.lessonId);
      const {
        title,
        slug,
        body,
        videoUrl,
        durationSec,
        timeline,
        thumbnail,
        isPreview,
      } = req.body;

      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          slug,
          body,
          videoUrl: videoUrl || null,
          durationSec: durationSec ?? null,
          timeline: Array.isArray(timeline) ? timeline : null,
          thumbnail: thumbnail || null,
          isPreview: !!isPreview,
        },
      });

      res.json(lesson);
    } catch (err) {
      next(err);
    }
  }
);


// DELETE lesson
router.delete(
  "/courses/:courseId/lessons/:lessonId",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_LESSON_DELETE"),
  async (req, res, next) => {
    try {
      const lessonId = Number(req.params.lessonId);
      await prisma.lesson.delete({ where: { id: lessonId } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
// POST /api/admin/courses/:courseId/lessons/reorder
router.post(
  "/courses/:courseId/lessons/reorder",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_LESSON_REORDER"),
  async (req, res, next) => {
    try {
      const courseId = Number(req.params.courseId);
      const { order } = req.body; // [{ lessonId, order }]

      if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid payload" });
      }

      // 🔒 HARD LOCK: cannot reorder after publish
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { status: true },
      });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.status === "PUBLISHED") {
        return res.status(409).json({
          message: "Cannot reorder lessons after course is published",
        });
      }

      await prisma.$transaction(
        order.map((l) =>
          prisma.lesson.update({
            where: { id: l.lessonId },
            data: { order: l.order },
          })
        )
      );

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// GET single lesson
router.get(
  "/courses/:courseId/lessons/:lessonId",
  verifyToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const lessonId = Number(req.params.lessonId);
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      res.json(lesson);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/courses/:courseId/lessons/:lessonId
router.get(
  "/courses/:courseId/lessons/:lessonId",
  verifyToken,
  requireAdmin,
  adminLogger("ADMIN_LESSON_GET"),
  async (req, res, next) => {
    try {
      const lessonId = Number(req.params.lessonId);

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      res.json(lesson);
    } catch (err) {
      next(err);
    }
  }
);



export default router;
