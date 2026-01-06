// perennisbackend/src/lib/validation/courseValidation.js
import prisma from "../prisma.js";

export async function validateCourse(courseId) {
  const issues = [];

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course) {
    issues.push("Course not found");
    return issues;
  }

  if (!course.durationMin) {
    issues.push("Course duration missing");
  }

  if (course.lessons.length === 0) {
    issues.push("Course has no lessons");
  }

  const seenOrders = new Set();

  for (const l of course.lessons) {
    if (!l.title) issues.push(`Lesson ${l.id} missing title`);
    if (!l.order) issues.push(`Lesson ${l.id} missing order`);
    if (!l.body && !l.videoUrl)
      issues.push(`Lesson "${l.title}" has no content`);

    if (seenOrders.has(l.order)) {
      issues.push(`Duplicate lesson order: ${l.order}`);
    }
    seenOrders.add(l.order);
  }

  return issues;
}
