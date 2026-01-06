/**
 * ❄️ INTELLIGENCE LAYER — FROZEN
 * These signals are observational.
 * Do NOT extend metrics or schemas without explicit versioning.
 */










import prisma from "../../prisma.js";


/**
 * Recompute curriculum intelligence snapshot
 * Safe to rerun. Overwrites existing rows.
 */
export async function computeCurriculumSignals() {
  // wipe old snapshot
  await prisma.curriculumSignal.deleteMany();

  /* ---------------- COURSES ---------------- */

  const courses = await prisma.course.findMany({
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      },
    },
  });

  for (const course of courses) {
    for (const lesson of course.lessons) {
      const lessonId = lesson.id;

      const progress = await prisma.lessonProgress.findMany({
        where: { lessonId },
        select: {
          watchedSeconds: true,
          maxPositionSec: true,
        },
      });

      const reflections = await prisma.reflection.findMany({
        where: { lessonId },
        select: { contentLength: true },
      });

      const enrollments = await prisma.lessonEnrollment.findMany({
        where: { lessonId },
        select: { completed: true },
      });

      const sampleSize = progress.length;

      if (sampleSize === 0) continue;

      const avgEngagement =
        progress.reduce((s, p) => s + p.maxPositionSec, 0) / sampleSize;

      const avgReflectionLen =
        reflections.length > 0
          ? reflections.reduce((s, r) => s + r.contentLength, 0) /
            reflections.length
          : null;

      const completionRate =
        enrollments.length > 0
          ? enrollments.filter((e) => e.completed).length /
            enrollments.length
          : null;

      const frictionRate =
        enrollments.length > 0
          ? reflections.length / enrollments.length
          : null;

      await prisma.curriculumSignal.create({
        data: {
          curriculumType: "COURSE",
          curriculumId: course.id,
          nodeIndex: lesson.order ?? 0,
          avgEngagement,
          avgReflectionLen,
          frictionRate,
          completionRate,
          sampleSize,
        },
      });
    }
  }

  /* ---------------- BOOKS ---------------- */

  const books = await prisma.book.findMany({
    select: { id: true },
  });

  for (const book of books) {
    const signals = await prisma.bookReadingSignal.findMany({
      where: { bookId: book.id },
    });

    if (signals.length === 0) continue;

    const avgEngagement =
      signals.reduce((s, r) => s + r.avgSessionDepth, 0) / signals.length;

    const avgReflectionLen =
      signals.reduce((s, r) => s + r.reflectionDensity, 0) /
      signals.length;

    const frictionRate =
      signals.reduce((s, r) => s + r.gateFriction, 0) / signals.length;

    await prisma.curriculumSignal.create({
      data: {
        curriculumType: "BOOK",
        curriculumId: book.id,
        nodeIndex: 0, // books are single-node for now
        avgEngagement,
        avgReflectionLen,
        frictionRate,
        completionRate: null,
        sampleSize: signals.length,
      },
    });
  }
}
