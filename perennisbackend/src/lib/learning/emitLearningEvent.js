// src/lib/learning/emitLearningEvent.js
import prisma from "../prisma.js";

export async function emitLearningEvent({
  userId,
  surfaceType,   // "LESSON"
  surfaceId,     // lessonId
  eventType,
  position = null,
  delta = null,
  metadata = null,
}) {
  return prisma.learningEvent.create({
    data: {
      userId,
      surfaceType,
      surfaceId,
      eventType,
      position,
      delta,
      metadata,
    },
  });
}
