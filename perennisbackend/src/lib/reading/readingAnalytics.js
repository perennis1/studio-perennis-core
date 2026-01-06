// src/lib/reading/readingAnalytics.ts
import prisma from "@/lib/prisma";

type ReadingSummary = {
  daysWithReading: number;
  lastReadAt: Date | null;
  currentStreakDays: number;
  longestStreakDays: number;
};

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function deriveCurrentStreak(dateKeys: string[], todayKey: string): number {
  let streak = 0;
  let expected = todayKey;

  for (const key of dateKeys) {
    if (key === expected) {
      streak++;
      const d = new Date(expected);
      d.setUTCDate(d.getUTCDate() - 1);
      expected = toDateKey(d);
    } else {
      break;
    }
  }
  return streak;
}

function deriveLongestStreak(dateKeys: string[]): number {
  let longest = 0;
  let current = 0;

  for (let i = 0; i < dateKeys.length; i++) {
    if (i === 0) {
      current = 1;
    } else {
      const prev = new Date(dateKeys[i - 1]);
      const curr = new Date(dateKeys[i]);
      const diff =
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        current++;
      } else {
        longest = Math.max(longest, current);
        current = 1;
      }
    }
  }

  return Math.max(longest, current);
}

export async function getReadingSummary(
  userId: number
): Promise<ReadingSummary> {
  const sessions = await prisma.readingSession.findMany({
    where: {
      userId,
      state: { in: ["ACTIVE", "COMPLETED"] },
    },
    select: {
      lastActiveAt: true,
    },
    orderBy: {
      lastActiveAt: "desc",
    },
  });

  if (sessions.length === 0) {
    return {
      daysWithReading: 0,
      lastReadAt: null,
      currentStreakDays: 0,
      longestStreakDays: 0,
    };
  }

  const dateKeys = Array.from(
    new Set(sessions.map((s) => toDateKey(s.lastActiveAt)))
  );

  const todayKey = toDateKey(new Date());

  return {
    daysWithReading: dateKeys.length,
    lastReadAt: sessions[0].lastActiveAt,
    currentStreakDays: deriveCurrentStreak(dateKeys, todayKey),
    longestStreakDays: deriveLongestStreak(dateKeys),
  };
}
