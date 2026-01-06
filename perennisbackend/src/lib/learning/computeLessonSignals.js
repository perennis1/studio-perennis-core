



/**
 * ❄️ INTELLIGENCE LAYER — FROZEN
 * These signals are observational.
 * Do NOT extend metrics or schemas without explicit versioning.
 */







import prisma from "../prisma.js";

export async function computeLessonSignals({ userId, lessonId }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { durationSec: true },
  });

  if (!lesson?.durationSec) return;

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (!progress) return;

  const watchRatio =
    progress.watchedSeconds / lesson.durationSec;

  const completionConfidence =
    progress.maxPositionSec / lesson.durationSec;

  const rewatchIntensity =
    progress.maxPositionSec > 0
      ? progress.watchedSeconds / progress.maxPositionSec
      : null;

  const timelineClicks = await prisma.lessonTimelineEvent.count({
    where: { userId, lessonId },
  });

  const timelineUsageRate =
    timelineClicks / Math.max(1, lesson.durationSec / 60);

  await prisma.lessonEngagementSignal.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      watchRatio,
      completionConfidence,
      rewatchIntensity,
      timelineUsageRate,
      computedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      watchRatio,
      completionConfidence,
      rewatchIntensity,
      timelineUsageRate,
    },
  });
}
