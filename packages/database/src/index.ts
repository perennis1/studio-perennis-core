// packages/database/src/index.ts - CORRECTED
export { PrismaClient, Prisma } from '@prisma/client';  // ← BACK TO ORIGINAL
export type {
  User, Post, Course, Lesson, Reflection, ProfileReadModel,
  CourseEnrollment,
  LessonEnrollment, UserCourseAccess, BookOrder, BookOrderItem, LibraryEntry
} from '@prisma/client';  // ← BACK TO ORIGINAL

export type { Prisma as PrismaTypes } from '@prisma/client';
