-- CreateEnum
CREATE TYPE "MockInterviewSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MockInterviewSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "seekerUserId" TEXT NOT NULL,
    "servicePlanId" TEXT,
    "stepKey" "SeekerServiceStepKey" NOT NULL DEFAULT 'INTERVIEW_COACHING',
    "status" "MockInterviewSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingId" TEXT,
    "joinUrl" TEXT,
    "subject" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "robotSideNote" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'TENCENT_MEETING',
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockInterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MockInterviewSession_tenantId_seekerUserId_createdAt_idx" ON "MockInterviewSession"("tenantId", "seekerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "MockInterviewSession_tenantId_status_idx" ON "MockInterviewSession"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "SeekerServicePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
