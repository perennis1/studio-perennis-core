import prisma from "../setup/prismaTestClient.js";

export async function seedBookWithGate({ gatePage }) {
  const user = await prisma.user.create({
    data: {
      email: `test_${Date.now()}@example.com`,
    },
  });

  const book = await prisma.book.create({
    data: {
      title: "Test Book",
      type: "CURRICULUM",
    },
  });

  const session = await prisma.readingSession.create({
    data: {
      userId: user.id,
      bookId: book.id,
      state: "ACTIVE",
      furthestAllowedPage: gatePage - 1,
    },
  });

  const gate = await prisma.reflectionGate.create({
    data: {
      bookId: book.id,
      pageNumber: gatePage,
      question: "What did you understand?",
      minLength: 50,
    },
  });

  await prisma.reflectionGateAssignment.create({
    data: {
      reflectionGateId: gate.id,
      active: true,
    },
  });

  return {
    userId: user.id,
    bookId: book.id,
    gateId: gate.id,
    sessionId: session.id,
  };
}
