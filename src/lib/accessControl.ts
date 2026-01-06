import prisma from "@/lib/prisma";

export async function canAccessBook(
  userId: number,
  bookId: number
): Promise<boolean> {
  const entry = await prisma.libraryEntry.findFirst({
    where: {
      userId,
      bookId,
    },
  });

  return !!entry;
}
