// src/routes/user.js

import fs from "fs";
import path from "path";
import multer from "multer";
import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { getAllUsersAdmin } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure upload folder exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Simple JWT auth
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// JSON‑only profile update
router.put("/user/update", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar, tagline } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar, tagline },
      select: { id: true, name: true, email: true, avatar: true, tagline: true },
    });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("❌ /user/update error:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
});

//---------------------READING PROGRESS---------------------------------

// GET /me/reading/summary



// GET /me/reading/books
router.get("/me/reading/books", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.readingSession.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            pages: true,
            coverImage: true,
          },
        },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    const result = sessions.map(s => ({
      bookId: s.book.id,
      title: s.book.title,
      coverImage: s.book.coverImage,
      state: s.state,
      lastSeenPage: s.lastSeenPage,
      progress:
        s.book.pages && s.lastSeenPage
          ? Math.min(1, s.lastSeenPage / s.book.pages)
          : 0,
      lastActiveAt: s.lastActiveAt,
    }));

    res.json(result);
  } catch (err) {
    console.error("READING BOOK LIST ERROR", err);
    res.status(500).json({ error: "Failed to load reading books" });
  }
});

router.post("/me/reading/session/:bookId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const bookId = Number(req.params.bookId);

  const session = await prisma.readingSession.upsert({
    where: {
      userId_bookId: { userId, bookId },
    },
    update: {
      state: "ACTIVE",
    },
    create: {
      userId,
      bookId,
      mode: "FREE",
      state: "ACTIVE",
    },
  });

  res.json(session);
});


router.post(
  "/me/reading/session/:bookId/progress",
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;
    const bookId = Number(req.params.bookId);
    const { page } = req.body;

    if (typeof page !== "number" || page < 1) {
      return res.status(400).json({ error: "Invalid page" });
    }

    const session = await prisma.readingSession.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (!session || session.state !== "ACTIVE") {
      return res.status(403).json({ error: "Session not active" });
    }

    const updated = await prisma.readingSession.update({
      where: { id: session.id },
      data: {
        lastSeenPage: page,
        furthestAllowedPage: Math.max(
          session.furthestAllowedPage ?? 0,
          page
        ),
      },
    });

    res.json(updated);
  }
);


router.get("/me/reading/bookshelf", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const entries = await prisma.libraryEntry.findMany({
    where: { userId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          coverImage: true,
        },
      },
    },
    orderBy: { acquiredAt: "desc" },
  });

  const sessions = await prisma.readingSession.findMany({
    where: { userId },
  });

  const sessionByBook = new Map(
    sessions.map((s) => [s.bookId, s])
  );

  const result = entries.map((e) => {
    const session = sessionByBook.get(e.bookId);

    return {
      bookId: e.bookId,
      format: e.format,
      acquiredAt: e.acquiredAt,
      book: e.book,
      reading: session
        ? {
            state: session.state,
            lastSeenPage: session.lastSeenPage,
            lastActiveAt: session.lastActiveAt,
          }
        : {
            state: "LOCKED", // owned but never opened
          },
    };
  });

  res.json({ entries: result });
});

// GET /me/reading/summary
router.get("/me/reading/summary", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const sessions = await prisma.readingSession.findMany({
      where: { userId },
      select: {
        state: true,
        startedAt: true,
        lastActiveAt: true,
      },
    });

    const summary = {
      booksStarted: sessions.length,
      booksCompleted: 0,
      booksActive: 0,
      booksAbandoned: 0,
      totalSessions: sessions.length,
      activeSessions: 0,
      lastReadAt: null,
      daysWithReading: 0,
    };

    const days = new Set();

    for (const s of sessions) {
      if (s.state === "COMPLETED") summary.booksCompleted++;
      if (s.state === "ACTIVE") {
        summary.booksActive++;
        summary.activeSessions++;
      }
      if (s.state === "ABANDONED") summary.booksAbandoned++;

      if (s.lastActiveAt) {
        days.add(s.lastActiveAt.toISOString().slice(0, 10));
        if (
          !summary.lastReadAt ||
          s.lastActiveAt > summary.lastReadAt
        ) {
          summary.lastReadAt = s.lastActiveAt;
        }
      }
    }

    summary.daysWithReading = days.size;

    res.json(summary);
  } catch (err) {
    console.error("READING SUMMARY ERROR", err);
    res.status(500).json({ error: "Failed to compute reading summary" });
  }
});



// GET /me/dashboard
router.get("/me/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { xp: true, level: true },
});


    // TODO: replace 1 with your real foundations courseId or derive active courseId
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { userId, courseId: 1 },
      include: { course: true },
    });

    const recentLessons = await prisma.lessonEnrollment.findMany({
      where: { userId, completed: true },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: {
        lesson: {
          select: { id: true, title: true, slug: true, courseId: true },
        },
      },
    });

    const recentActivities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        createdAt: true,
        lesson: {
          select: { id: true, title: true, slug: true, courseId: true },
        },
      },
    });

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo, lte: now },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, type: true },
    });

    const lessonsCompletedThisWeek = activities.filter(
      (a) => a.type === "lesson_completed"
    ).length;

    const activeDays = new Set(
      activities.map((a) => a.createdAt.toISOString().slice(0, 10))
    );

    let streakDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (activeDays.has(key)) streakDays += 1;
      else break;
    }

    const weeklyMinutes = activeDays.size * 30;
 
    res.json({
      enrollment,
      recentLessons,
      streakDays,
      weeklyMinutes,
      recentActivities,
      lessonsCompletedThisWeek,
       xp: user?.xp ?? 0,
  level: user?.level ?? 1,
    });
  } catch (err) {
    console.error("GET /me/dashboard FULL ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to load dashboard", error: err.message });
  }
});


// Main profile update with avatar upload
router.put("/update", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    const { name, tagline } = req.body;
    const userId = req.user.id;

    let avatarPath;
    if (req.file) {
      const baseUrl =
        process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      avatarPath = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        tagline,
        ...(avatarPath && { avatar: avatarPath }),
      },
      select: { id: true, name: true, email: true, avatar: true, tagline: true },
    });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("❌ /update error:", error);
    res.status(500).json({ error: error.message });
  }
});


// GET /me/reflections (active only)
router.get("/me/reflections", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const take = Math.min(parseInt(req.query.take ?? "10", 10) || 10, 50);
    const skip = parseInt(req.query.skip ?? "0", 10) || 0;

    const reflections = await prisma.reflection.findMany({
      where: { userId, deleted: false },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: { id: true, text: true, createdAt: true },
    });

    const total = await prisma.reflection.count({
      where: { userId, deleted: false },
    });

    res.json({
      items: reflections.map((r) => ({
        id: r.id,
        text: r.text,
        date: r.createdAt,
      })),
      total,
      hasMore: skip + take < total,
    });
  } catch (err) {
    console.error("GET /me/reflections error", err);
    res.status(500).json({ message: "Failed to load reflections" });
  }
});

// POST /me/reflections - add a new reflection
// POST /me/reflections - add a new reflection
router.post("/me/reflections", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Reflection text is required" });
    }

    // 1) Create reflection
    const reflection = await prisma.reflection.create({
      data: {
        userId,
        text: text.trim(),
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
      },
    });

    // 2) Read current inquiry from profile
    const profile = await prisma.profileReadModel.findUnique({
      where: { userId },
      select: { currentInquiry: true },
    });

    // 3) Update lastActiveInquiry to whatever the currentInquiry is now
    await prisma.profileReadModel.upsert({
      where: { userId },
      update: {
        lastActiveInquiry: profile?.currentInquiry ?? null,
      },
      create: {
        userId,
        // If there is no profile yet, we keep lastActiveInquiry null.
        currentInquiry: null,
        currentlyStudying: null,
        lastActiveInquiry: null,
      },
    });

    res.status(201).json({
      id: reflection.id,
      text: reflection.text,
      date: reflection.createdAt,
    });
  } catch (err) {
    console.error("POST /me/reflections error", err);
    res.status(500).json({ message: "Failed to add reflection" });
  }
});

// GET /me/reflections/trash (soft-deleted only)
router.get("/me/reflections/trash", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.reflection.findMany({
      where: { userId, deleted: true },
      orderBy: { deletedAt: "desc" },
      select: { id: true, text: true, createdAt: true, deletedAt: true },
    });

    res.json(
      items.map((r) => ({
        id: r.id,
        text: r.text,
        date: r.createdAt,
        deletedAt: r.deletedAt,
      }))
    );
  } catch (err) {
    console.error("GET /me/reflections/trash error", err);
    res.status(500).json({ message: "Failed to load trash" });
  }
});



// DELETE /me/reflections/:id - soft delete
router.delete("/me/reflections/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await prisma.reflection.updateMany({
      where: { id, userId, deleted: false },
      data: { deleted: true, deletedAt: new Date() },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /me/reflections/:id error", err);
    res.status(500).json({ message: "Failed to delete reflection" });
  }
});

// POST /me/reflections/:id/restore - undo soft delete
router.post("/me/reflections/:id/restore", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const updated = await prisma.reflection.updateMany({
      where: { id, userId, deleted: true },
      data: { deleted: false, deletedAt: null },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Reflection not found" });
    }

    const reflection = await prisma.reflection.findUnique({
      where: { id },
      select: { id: true, text: true, createdAt: true },
    });

    res.json({
      id: reflection.id,
      text: reflection.text,
      date: reflection.createdAt,
    });
  } catch (err) {
    console.error("POST /me/reflections/:id/restore error", err);
    res.status(500).json({ message: "Failed to restore reflection" });
  }
});


// DELETE /me/reflections/:id/hard - permanent delete
router.delete("/me/reflections/:id/hard", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await prisma.reflection.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /me/reflections/:id/hard error", err);
    res.status(500).json({ message: "Failed to hard delete reflection" });
  }
});


// GET /me/courses – enrolled courses with progress for current user
router.get("/me/courses", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

  const enrollments = await prisma.courseEnrollment.findMany({
  where: { userId },
  include: {
    course: {
      select: {
        id: true,
        title: true,
        slug: true,
        level: true,
        summary: true,
        durationMin: true,
        _count: { select: { lessons: true } },
      },
    },
  },
  orderBy: { enrolledAt: "desc" },

});


    const result = enrollments.map((e) => ({
      courseId: e.courseId,
      progress: e.progress,
      course: {
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        level: e.course.level,
        summary: e.course.summary,
        durationMin: e.course.durationMin,
        lessonsCount: e.course._count.lessons,
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /me/courses error", err);
    res.status(500).json({ message: "Failed to load user courses" });
  }
});

// GET /me/progress
router.get("/me/progress", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

   const enrollments = await prisma.courseEnrollment.findMany({
  where: { userId },
  include: {
    course: {
      select: {
        id: true,
        title: true,
        slug: true,
        durationMin: true,
      },
    },
  },
});


    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.progress >= 1).length;

    const totalLessonsCompleted = await prisma.lessonEnrollment.count({
      where: { userId, completed: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
      },
    });

    const perCourse = enrollments.map((e) => ({
      courseId: e.courseId,
      title: e.course.title,
      slug: e.course.slug,
      durationMin: e.course.durationMin,
      progress: e.progress,
    }));

    res.json({
      stats: {
        totalCourses,
        completedCourses,
        totalLessonsCompleted,
        xp: user?.xp ?? 0,
        // placeholders for future fields
        currentStreakDays: 0,
        longestStreakDays: 0,
        totalMinutesLearned: 0,
        level: user?.level ?? 1,
      },
      perCourse,
    });
  } catch (err) {
    console.error("GET /me/progress error", err);
    res.status(500).json({ message: "Failed to load progress" });
  }
});

// GET /me/profile
router.get("/me/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profileReadModel.findUnique({
      where: { userId },
      select: {
        currentInquiry: true,
        currentlyStudying: true,
        lastActiveInquiry: true,
        updatedAt: true,
      },
    });

    res.json(
      profile ?? {
        currentInquiry: null,
        currentlyStudying: null,
        lastActiveInquiry: null,
        updatedAt: null,
      }
    );
  } catch (err) {
    console.error("GET /me/profile error", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

// PUT /me/profile
router.put("/me/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentInquiry, currentlyStudying } = req.body; // lastActiveInquiry intentionally ignored

    const normalizedCurrentInquiry =
      typeof currentInquiry === "string" && currentInquiry.trim().length > 0
        ? currentInquiry.trim()
        : null;

    const normalizedCurrentlyStudying =
      typeof currentlyStudying === "string" && currentlyStudying.trim().length > 0
        ? currentlyStudying.trim()
        : null;

    const profile = await prisma.profileReadModel.upsert({
      where: { userId },
      update: {
        currentInquiry: normalizedCurrentInquiry,
        currentlyStudying: normalizedCurrentlyStudying,
        // lastActiveInquiry is *not* updated here; it will be set from learning events later
      },
      create: {
        userId,
        currentInquiry: normalizedCurrentInquiry,
        currentlyStudying: normalizedCurrentlyStudying,
        // lastActiveInquiry left null on create; becomes a true ledger artifact later
      },
      select: {
        currentInquiry: true,
        currentlyStudying: true,
        lastActiveInquiry: true,
        updatedAt: true,
      },
    });

    res.json(profile);
  } catch (err) {
    console.error("PUT /me/profile error", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET /me/profile
router.get("/me/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profileReadModel.findUnique({
      where: { userId },
      select: {
        currentInquiry: true,
        currentlyStudying: true,
        lastActiveInquiry: true,
        updatedAt: true,
      },
    });

    res.json(
      profile ?? {
        currentInquiry: null,
        currentlyStudying: null,
        lastActiveInquiry: null,
        updatedAt: null,
      }
    );
  } catch (err) {
    console.error("GET /me/profile error", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});






// admin-only users list
router.get("/admin/users", getAllUsersAdmin);




export default router;
