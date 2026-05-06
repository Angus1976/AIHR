-- CreateEnum
CREATE TYPE "SmsOtpPurpose" AS ENUM ('LOGIN_PHONE', 'ENTERPRISE_CONTACT_VERIFY');

-- CreateTable
CREATE TABLE "SmsOtp" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "phone" TEXT NOT NULL,
    "purpose" "SmsOtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "verifyAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsOtp_phone_purpose_createdAt_idx" ON "SmsOtp"("phone", "purpose", "createdAt");

-- AddForeignKey
ALTER TABLE "SmsOtp" ADD CONSTRAINT "SmsOtp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
