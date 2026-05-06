-- CreateEnum
CREATE TYPE "InterviewOpportunityStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "InterviewOpportunity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "seekerUserId" TEXT NOT NULL,
    "pushedById" TEXT NOT NULL,
    "status" "InterviewOpportunityStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "note" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewOpportunity_jobPostingId_seekerUserId_key" ON "InterviewOpportunity"("jobPostingId", "seekerUserId");

-- CreateIndex
CREATE INDEX "InterviewOpportunity_tenantId_seekerUserId_status_createdAt_idx" ON "InterviewOpportunity"("tenantId", "seekerUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewOpportunity_tenantId_jobPostingId_status_idx" ON "InterviewOpportunity"("tenantId", "jobPostingId", "status");

-- AddForeignKey
ALTER TABLE "InterviewOpportunity" ADD CONSTRAINT "InterviewOpportunity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewOpportunity" ADD CONSTRAINT "InterviewOpportunity_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewOpportunity" ADD CONSTRAINT "InterviewOpportunity_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewOpportunity" ADD CONSTRAINT "InterviewOpportunity_pushedById_fkey" FOREIGN KEY ("pushedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
