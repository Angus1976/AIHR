-- AlterTable
ALTER TABLE "ServiceStepInteraction"
ADD COLUMN "feedbackRating" INTEGER,
ADD COLUMN "feedbackText" TEXT,
ADD COLUMN "feedbackAt" TIMESTAMP(3);
