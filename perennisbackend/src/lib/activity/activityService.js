import prisma from "../prisma.js";

export async function recordActivity({
  userId,
  entityType,
  entityId,
  action,
  metadata,
}) {
  await prisma.activityEvent.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      metadata: metadata || null,
    },
  });
}
