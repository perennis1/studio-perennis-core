-- CreateTable
CREATE TABLE "ProfileReadModel" (
    "userId" INTEGER NOT NULL,
    "currentInquiry" TEXT,
    "currentlyStudying" TEXT,
    "lastActiveInquiry" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileReadModel_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "ProfileReadModel" ADD CONSTRAINT "ProfileReadModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
