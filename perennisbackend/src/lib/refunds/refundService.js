// src/lib/refunds/refundService.js
import prisma from "../prisma.js";

export async function refundBookAccess({
  adminId,
  userId,
  bookId,
  paymentId,
  reason,
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Ensure user owns the book
    const libraryEntry = await tx.libraryEntry.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (!libraryEntry) {
      throw new Error("Library entry not found");
    }

    // 2. Revoke access
    await tx.libraryEntry.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    // 3. Close reading sessions
    await tx.readingSession.updateMany({
      where: {
        userId,
        bookId,
        state: { in: ["ACTIVE", "COMPLETED"] },
      },
      data: {
        state: "LOCKED",
        endedAt: new Date(),
      },
    });

    // 4. Ledger entry
    await tx.ledgerEvent.create({
      data: {
        type: "ACCESS_REVOKED",
        actorId: adminId,
        userId,
        bookId,
        paymentId,
        reason: reason || "Admin refund",
      },
    });

    return { success: true };
  });
}
