-- CreateTable
CREATE TABLE "ServiceStepInteraction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "promptKey" TEXT NOT NULL,
    "inputText" TEXT,
    "outputText" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "modelName" TEXT,
    "routeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceStepInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceStepInteraction_tenantId_stepId_createdAt_idx" ON "ServiceStepInteraction"("tenantId", "stepId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceStepInteraction_tenantId_requestedById_createdAt_idx" ON "ServiceStepInteraction"("tenantId", "requestedById", "createdAt");

-- AddForeignKey
ALTER TABLE "ServiceStepInteraction" ADD CONSTRAINT "ServiceStepInteraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStepInteraction" ADD CONSTRAINT "ServiceStepInteraction_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "SeekerServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStepInteraction" ADD CONSTRAINT "ServiceStepInteraction_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
