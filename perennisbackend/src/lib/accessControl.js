// src/lib/accessControl.js
import prisma from "./prisma.js";

/**
 * BOOK ACCESS
 * User must own the book (library entry)
 */
export async function canAccessBook(userId, bookId) {
  if (!userId || !bookId) return false;

  const entry = await prisma.libraryEntry.findFirst({
    where: { userId, bookId },
    select: { id: true },
  });

  return !!entry;
}

/**
 * COURSE ACCESS
 * Paid access via userCourseAccess
 */
export async function canAccessCourse(userId, courseId) {
  if (!userId || !courseId) return false;

  const access = await prisma.userCourseAccess.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { id: true },
  });

  return !!access;
}

/**
 * LESSON ACCESS
 * - Preview → logged-in users
 * - Full → paid course access
 */
export async function canAccessLesson(userId, lessonId) {
  if (!lessonId) return false;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      isPreview: true,
      courseId: true,
    },
  });

  if (!lesson) return false;

  if (lesson.isPreview) {
    return !!userId;
  }

  if (!userId) return false;

  const access = await prisma.userCourseAccess.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
    select: { id: true },
  });

  return !!access;
}

/**
 * REFLECTION GATE
 * Lesson completion requires a valid reflection
 */
export async function hasValidReflection(userId, lessonId) {
  if (!userId || !lessonId) return false;

  const reflection = await prisma.reflection.findFirst({
    where: {
      userId,
      lessonId,
      deletedAt: null,
    },
    select: { id: true },
  });

  return !!reflection;
}
