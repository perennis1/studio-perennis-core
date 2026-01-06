//C:\Users\studi\my-next-app\perennisbackend\src\lib\reading\reflectionGateService.js

import prisma from "../prisma.js";
import { getCurrentCurriculumStep } from "../curriculum/curriculumService.js";
import { resolveReaderAuthority } from "./readerAuthorityService.js";
import { evaluateReflectionQuality } from "./reflectionQualityService.js";

/**
 * ======================================================
 * PAGE ACCESS CHECK
 * ======================================================
 */
export async function checkPageAccess({ userId, bookId, pageNumber }) {

  /* --------------------------------------------------
   * 1. FETCH ACTIVE READING SESSION
   * -------------------------------------------------- */
  const session = await prisma.readingSession.findFirst({
    where: { userId, bookId, state: "ACTIVE" },
    orderBy: { startedAt: "desc" },
  });

  if (!session) {
    throw new Error("No active reading session");
  }

  /* --------------------------------------------------
   * 2. RESOLVE READER AUTHORITY (STEP 7)
   * -------------------------------------------------- */
  const authority = await resolveReaderAuthority({ userId, bookId });

  // GENERAL BOOKS — FULL FREE READ
  if (authority.bookType === "GENERAL") {
    return { allowed: true };
  }

  /* --------------------------------------------------
   * 3. STEP 6 — TIME WINDOW ENFORCEMENT
   * -------------------------------------------------- */
  if (authority.allowTimeWindows) {
    const now = new Date();

    const window = await prisma.readingWindow.findFirst({
      where: {
        bookId,
        active: true,
        startAt: { lte: now },
        endAt: { gte: now },
        OR: [
          { cohortId: null },
          { cohortId: session.cohortId ?? -1 },
        ],
      },
    });

    if (!window) {
      return {
        allowed: false,
        reason: "OUTSIDE_READING_WINDOW",
      };
    }
  }

  /* --------------------------------------------------
   * 4. CURRICULUM SEQUENCE CHECK (STEP 5.3)
   * -------------------------------------------------- */
  const lockedStep = await getCurrentCurriculumStep({
    userId,
    bookId,
    cohortId: session.cohortId,
  });

  /* --------------------------------------------------
   * 5. HARD PAGE BOUNDARY
   * -------------------------------------------------- */
  const furthest = session.furthestAllowedPage ?? 1;

  if (pageNumber > furthest) {

    /* ----------------------------------------------
     * 6. FETCH NEXT APPLICABLE GATE (STEP 5.2)
     * ---------------------------------------------- */
    const gate = await prisma.reflectionGate.findFirst({
      where: {
        bookId,
        pageNumber: furthest + 1,
        assignments: {
          some: {
            active: true,
            OR: [
              { cohortId: null },
              { cohortId: session.cohortId ?? -1 },
            ],
          },
        },
      },
    });

    /* ----------------------------------------------
     * 7. CURRICULUM ORDER ENFORCEMENT
     * ---------------------------------------------- */
    if (
      lockedStep &&
      lockedStep.type === "REFLECTION_GATE" &&
      lockedStep.refId !== gate?.id
    ) {
      return {
        allowed: false,
        gate: null,
        reason: "CURRICULUM_LOCKED",
      };
    }

    return {
      allowed: false,
      gate: gate
        ? {
            id: gate.id,
            pageNumber: gate.pageNumber,
            question: gate.question,
            minLength: gate.minLength,
          }
        : null,
    };
  }

  return { allowed: true };
}

/**
 * ======================================================
 * GATE SATISFACTION
 * ======================================================
 */
export async function satisfyGate({ userId, bookId, gateId, answerText }) {
  return prisma.$transaction(async (tx) => {

    /* --------------------------------------------------
     * 1. FETCH ACTIVE SESSION
     * -------------------------------------------------- */
    const session = await tx.readingSession.findFirst({
      where: { userId, bookId, state: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      throw new Error("No active reading session");
    }

    /* --------------------------------------------------
     * 2. ENFORCE READER AUTHORITY (STEP 7)
     * -------------------------------------------------- */
    const authority = await resolveReaderAuthority({ userId, bookId });

    if (authority.bookType === "GENERAL") {
      throw new Error("Reflections are not allowed for general reading");
    }

    /* --------------------------------------------------
     * 3. FETCH GATE
     * -------------------------------------------------- */
    const gate = await tx.reflectionGate.findUnique({
      where: { id: gateId },
    });

    if (!gate) {
      throw new Error("Gate not found");
    }

    /* --------------------------------------------------
     * 4. MODE-SENSITIVE VALIDATION
     * -------------------------------------------------- */
    const minLength =
      session.mode === "INQUIRY"
        ? gate.minLength * 2
        : gate.minLength;

    if (answerText.length < minLength) {
      throw new Error(`Reflection too short (min ${minLength})`);
    }

    /* --------------------------------------------------
     * 5. ENSURE GATE WAS ACTUALLY REACHED
     * -------------------------------------------------- */
    if (
      session.lastSeenPage == null ||
      session.lastSeenPage < gate.pageNumber
    ) {
      throw new Error("Gate not reached yet");
    }

    /* --------------------------------------------------
     * 6. REFLECTION QUALITY EVALUATION (STEP 11)
     * -------------------------------------------------- */
    const previousAnswers = await tx.reflectionAnswer.findMany({
      where: {
        userId,
        gate: {
          bookId,
        },
      },
      select: { text: true },
    });

    const quality = evaluateReflectionQuality({
      text: answerText,
      previousAnswers: previousAnswers.map(a => a.text),
      minLength,
    });

    /* --------------------------------------------------
     * 7. RECORD ANSWER
     * -------------------------------------------------- */
    await tx.reflectionAnswer.create({
      data: {
        gateId,
        userId,
        text: answerText,
        quality,
        flagged: quality !== "OK",
      },
    });

    /* --------------------------------------------------
     * 8. ADVANCE HARD READING BOUNDARY
     * -------------------------------------------------- */
    await tx.readingSession.update({
      where: { id: session.id },
      data: {
        furthestAllowedPage: gate.pageNumber + 1,
      },
    });

    /* --------------------------------------------------
     * 9. ACTIVITY LOG
     * -------------------------------------------------- */
    await tx.activityEvent.create({
      data: {
        userId,
        entityType: "BOOK",
        entityId: bookId,
        action: "REFLECTION",
        metadata: { gateId, pageNumber: gate.pageNumber },
      },
    });

    return { success: true };
  });
}
