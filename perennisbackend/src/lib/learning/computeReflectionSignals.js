import prisma from "../prisma.js";

export async function computeReflectionSignals({ reflectionId }) {
  const reflection = await prisma.reflection.findUnique({
    where: { id: reflectionId },
    include: {
      lesson: true,
      user: true,
    },
  });

  if (!reflection) return;

  const length = reflection.contentLength;
  const revisions = reflection.revisionCount;

  const openEvent = await prisma.learningEvent.findFirst({
    where: {
      userId: reflection.userId,
      surfaceType: "LESSON",
      surfaceId: reflection.lessonId,
      eventType: "LESSON_OPENED",
    },
    orderBy: { createdAt: "asc" },
  });

  const latencySec = openEvent
    ? Math.floor(
        (reflection.createdAt.getTime() -
          openEvent.createdAt.getTime()) / 1000
      )
    : null;

  let quality = "OK";
  if (length < 80) quality = "LOW";
  if (length > 400 && revisions > 0) quality = "HIGH";

  await prisma.reflection.update({
    where: { id: reflectionId },
    data: {
      latencySec,
      qualityHint: quality,
    },
  });
}
