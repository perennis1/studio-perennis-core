import prisma from "./prismaTestClient.js";

beforeEach(async () => {
  await prisma.$transaction([
    prisma.activityEvent.deleteMany(),
    prisma.reflectionAnswer.deleteMany(),
    prisma.reflectionGateAssignment.deleteMany(),
    prisma.reflectionGate.deleteMany(),
    prisma.readingSession.deleteMany(),
    prisma.book.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});
