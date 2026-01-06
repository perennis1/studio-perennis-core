// src/lib/reading/readingMetricsService.js

function daysBetween(a, b) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((a - b) / MS_PER_DAY);
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * COMPLETION VELOCITY
 */
export function computeCompletionVelocity(sessions) {
  if (sessions.length === 0) {
    return {
      pagesPerDay: null,
      sessionsCount: 0,
      timeToCompletionDays: null,
    };
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalPagesRead = Math.max(
    ...sessions.map((s) => s.lastSeenPage || 0)
  );

  const activeDays = new Set(
    sessions.map((s) => s.lastActiveAt.toISOString().slice(0, 10))
  ).size;

  const completedSession = sessions.find(
    (s) => s.state === "COMPLETED"
  );

  return {
    pagesPerDay:
      activeDays > 0 ? totalPagesRead / activeDays : null,

    sessionsCount: sessions.length,

    timeToCompletionDays: completedSession
      ? daysBetween(
          new Date(completedSession.lastActiveAt),
          new Date(first.createdAt)
        )
      : null,
  };
}

/**
 * HABIT METRICS
 */
export function computeHabitMetrics(sessions) {
  if (sessions.length < 2) {
    return {
      medianReturnGapDays: null,
      readingDensity: null,
      inferredAbandoned: false,
    };
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.lastActiveAt) - new Date(b.lastActiveAt)
  );

  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(
      daysBetween(
        new Date(sorted[i].lastActiveAt),
        new Date(sorted[i - 1].lastActiveAt)
      )
    );
  }

  const firstDay = new Date(sorted[0].lastActiveAt);
  const today = new Date();
  const daysSinceFirstRead = Math.max(
    daysBetween(today, firstDay),
    1
  );

  const readingDays = new Set(
    sessions.map((s) => s.lastActiveAt.toISOString().slice(0, 10))
  ).size;

  const lastReadAt = new Date(
    sorted[sorted.length - 1].lastActiveAt
  );

  const inferredAbandoned =
    daysBetween(today, lastReadAt) > 14 &&
    !sessions.some((s) => s.state === "COMPLETED");

  return {
    medianReturnGapDays: median(gaps),
    readingDensity: readingDays / daysSinceFirstRead,
    inferredAbandoned,
  };
}
