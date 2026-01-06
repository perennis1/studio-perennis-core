import prisma from "../prisma.js";

/**
 * Unified activity stream resolver.
 * Read-only. Authority-filtered.
 */
export async function getActivityStream({
  viewerType,   // "USER" | "ADMIN"
  viewerUserId,
  cohortId,
  limit = 50,
}) {
  // Base query
  let where = {};

  // USER VIEW — sees own activity only
  if (viewerType === "USER") {
    where.userId = viewerUserId;
  }

  // ADMIN VIEW — curriculum only
  if (viewerType === "ADMIN") {
    where.entityType = {
      in: ["BOOK", "LESSON", "COURSE"],
    };
  }

  const events = await prisma.activityEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return events.map((e) => ({
    id: e.id,
    userId: e.userId,
    userName: e.user?.name ?? null,
    entityType: e.entityType,
    entityId: e.entityId,
    action: e.action,
    metadata: e.metadata,
    createdAt: e.createdAt,
  }));
}
