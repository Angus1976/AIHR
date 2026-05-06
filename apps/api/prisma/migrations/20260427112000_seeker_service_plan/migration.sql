-- CreateEnum
CREATE TYPE "SeekerServicePlanStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SeekerServiceStepKey" AS ENUM ('PRE_CAREER_PLANNING', 'RESUME_OPTIMIZATION', 'INTERVIEW_COACHING', 'INTERVIEW_CONFIRMATION', 'POST_OFFER_COACHING', 'POST_CONVERSION_PLANNING');

-- CreateEnum
CREATE TYPE "SeekerServiceStepStatus" AS ENUM ('LOCKED', 'NOT_STARTED', 'IN_PROGRESS', 'DELIVERED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "ServiceProviderType" AS ENUM ('PLATFORM', 'PARTNER', 'AI_ASSISTED', 'HYBRID');

-- CreateEnum
CREATE TYPE "PaymentMilestoneKey" AS ENUM ('SIGN_CONTRACT', 'OFFER_DEPOSIT', 'MONTH_2_BALANCE', 'MONTH_3_BALANCE', 'REGULARIZATION_GIFT', 'RENEWAL');

-- CreateEnum
CREATE TYPE "PaymentMilestoneStatus" AS ENUM ('LOCKED', 'PAYABLE', 'PAID', 'WAIVED', 'REFUNDED');

-- CreateTable
CREATE TABLE "SeekerServicePlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "seekerUserId" TEXT NOT NULL,
    "status" "SeekerServicePlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "targetRole" TEXT,
    "salaryMinFen" INTEGER,
    "salaryMaxFen" INTEGER,
    "signedContractId" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeekerServicePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeekerServiceStep" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "key" "SeekerServiceStepKey" NOT NULL,
    "title" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "providerType" "ServiceProviderType" NOT NULL,
    "status" "SeekerServiceStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "sortOrder" INTEGER NOT NULL,
    "checklist" JSONB,
    "deliverableSummary" TEXT,
    "partnerOrgName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeekerServiceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePaymentMilestone" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "key" "PaymentMilestoneKey" NOT NULL,
    "title" TEXT NOT NULL,
    "amountFen" INTEGER NOT NULL,
    "status" "PaymentMilestoneStatus" NOT NULL DEFAULT 'LOCKED',
    "triggerText" TEXT NOT NULL,
    "orderId" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePaymentMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeekerServicePlan_tenantId_seekerUserId_key" ON "SeekerServicePlan"("tenantId", "seekerUserId");

-- CreateIndex
CREATE INDEX "SeekerServicePlan_tenantId_status_updatedAt_idx" ON "SeekerServicePlan"("tenantId", "status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeekerServiceStep_planId_key_key" ON "SeekerServiceStep"("planId", "key");

-- CreateIndex
CREATE INDEX "SeekerServiceStep_planId_sortOrder_idx" ON "SeekerServiceStep"("planId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePaymentMilestone_planId_key_key" ON "ServicePaymentMilestone"("planId", "key");

-- CreateIndex
CREATE INDEX "ServicePaymentMilestone_planId_sortOrder_idx" ON "ServicePaymentMilestone"("planId", "sortOrder");

-- AddForeignKey
ALTER TABLE "SeekerServicePlan" ADD CONSTRAINT "SeekerServicePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeekerServicePlan" ADD CONSTRAINT "SeekerServicePlan_seekerUserId_fkey" FOREIGN KEY ("seekerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeekerServiceStep" ADD CONSTRAINT "SeekerServiceStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SeekerServicePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePaymentMilestone" ADD CONSTRAINT "ServicePaymentMilestone_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SeekerServicePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePaymentMilestone" ADD CONSTRAINT "ServicePaymentMilestone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
