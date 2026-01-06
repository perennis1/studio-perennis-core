import prisma from "../prisma.js";

/**
 * Create a new inquiry thread from a reflection.
 */
export async function createInquiryThread({
  userId,
  reflectionAnswerId,
  title,
}) {
  return prisma.$transaction(async (tx) => {
    const thread = await tx.inquiryThread.create({
      data: {
        userId,
        title,
      },
    });

    await tx.reflectionAnswer.update({
      where: { id: reflectionAnswerId },
      data: {
        inquiryThreadId: thread.id,
      },
    });

    return thread;
  });
}

/**
 * Attach reflection to an existing inquiry thread.
 */
export async function attachToInquiryThread({
  reflectionAnswerId,
  inquiryThreadId,
}) {
  return prisma.reflectionAnswer.update({
    where: { id: reflectionAnswerId },
    data: { inquiryThreadId },
  });
}
