











/**
 * ❄️ INTELLIGENCE LAYER — FROZEN
 * These signals are observational.
 * Do NOT extend metrics or schemas without explicit versioning.
 */



import prisma from "../prisma.js";

export async function getCrossSurfaceProfile(userId) {
  const lessonSignals = await prisma.lessonEngagementSignal.findMany({
    where: { userId },
  });

  const bookSignals = await prisma.bookReadingSignal.findMany({
    where: { userId },
  });

  return {
    lessonAvgWatchRatio:
      avg(lessonSignals.map(l => l.watchRatio)),

    lessonReflectionIntensity:
      avg(lessonSignals.map(l => l.rewatchIntensity)),

    bookAvgSessionDepth:
      avg(bookSignals.map(b => b.avgSessionDepth)),

    bookReflectionDensity:
      avg(bookSignals.map(b => b.reflectionDensity)),
  };
}

function avg(arr) {
  const v = arr.filter(x => typeof x === "number");
  return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null;
}
