import prisma from "../prisma.js";

export async function getReflectionInsights({ bookId, cohortId = null }) {
  const answers = await prisma.reflectionAnswer.findMany({
    where: {
      gate: {
        bookId,
        assignments: {
          some: {
            active: true,
            OR: [
              { cohortId: null },
              { cohortId },
            ],
          },
        },
      },
    },
    include: {
      gate: true,
    },
  });

  const byGate = {};

  for (const a of answers) {
    const key = a.gateId;
    if (!byGate[key]) {
      byGate[key] = {
        gateId: key,
        question: a.gate.question,
        total: 0,
        flagged: 0,
        quality: {},
      };
    }

    byGate[key].total += 1;
    if (a.flagged) byGate[key].flagged += 1;

    byGate[key].quality[a.quality] =
      (byGate[key].quality[a.quality] || 0) + 1;
  }

  return Object.values(byGate).map((g) => ({
    ...g,
    frictionScore:
      g.total === 0 ? 0 : g.flagged / g.total,
  }));
}
