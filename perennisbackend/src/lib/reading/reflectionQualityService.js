/**
 * Non-AI reflection quality evaluator.
 * Pure heuristics. Fully explainable.
 */
export function evaluateReflectionQuality({
  text,
  previousAnswers = [],
  minLength,
}) {
  const trimmed = text.trim();

  // 1. Bare minimum compliance
  if (trimmed.length < minLength * 1.2) {
    return "LOW_EFFORT";
  }

  // 2. Repetition detection (very simple)
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");

  for (const prev of previousAnswers) {
    const prevNorm = prev
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (prevNorm === normalized) {
      return "REPETITIVE";
    }
  }

  return "OK";
}
