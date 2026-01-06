import prisma from "../prisma.js";

/**
 * Get open inquiry threads with last activity.
 */
export async function getOpenInquiryThreads({ userId }) {
  const threads = await prisma.inquiryThread.findMany({
    where: {
      userId,
      open: true,
    },
    include: {
      _count: {
        select: { ReflectionAnswer: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads;
}
