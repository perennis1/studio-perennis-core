import prisma from "../prisma.js";

export async function getGateSuggestions({ bookId, cohortId = null }) {
  const gates = await prisma.reflectionGate.findMany({
    where: { bookId },
    include: {
      answers: true,
    },
  });

  const suggestions = [];

  for (const gate of gates) {
    const total = gate.answers.length;
    if (total < 5) continue; // ignore weak data

    const flagged = gate.answers.filter(a => a.flagged).length;
    const lowQuality = gate.answers.filter(
      a => a.quality !== "OK"
    ).length;

    const avgLength =
      gate.answers.reduce((s, a) => s + a.text.length, 0) / total;

    const friction = flagged / total;
    const lowQualityRatio = lowQuality / total;

    if (friction >= 0.6 && lowQualityRatio >= 0.5) {
      suggestions.push({
        gateId: gate.id,
        type: "REWORD_GATE",
        reason: "High friction and low reflection quality",
      });
    }

    if (avgLength < gate.minLength * 1.2) {
      suggestions.push({
        gateId: gate.id,
        type: "MOVE_GATE_LATER",
        reason: "Responses too short; likely insufficient context",
      });
    }

    if (friction >= 0.7 && avgLength > gate.minLength * 3) {
      suggestions.push({
        gateId: gate.id,
        type: "SPLIT_GATE",
        reason: "Responses verbose under strain; cognitive overload",
      });
    }
  }

  return suggestions;
}
