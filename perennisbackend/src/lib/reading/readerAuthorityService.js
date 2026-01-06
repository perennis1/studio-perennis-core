import prisma from "../prisma.js";

/**
 * Resolve the governing authority for a book.
 * This function defines the LAW of the reader.
 */
export async function resolveReaderAuthority({ userId, bookId }) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { type: true },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  // GENERAL BOOKS — PRIVATE READING
  if (book.type === "GENERAL") {
    return {
      bookType: "GENERAL",
      allowFreeRead: true,
      allowCurriculum: false,
      allowGates: false,
      allowTimeWindows: false,
    };
  }

  // CURRICULUM BOOKS — CONTROLLED READING
  return {
    bookType: "CURRICULUM",
    allowFreeRead: false,
    allowCurriculum: true,
    allowGates: true,
    allowTimeWindows: true,
  };
}
