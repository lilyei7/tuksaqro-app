-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetPasswordExpiresAt" DATETIME;
ALTER TABLE "users" ADD COLUMN "resetPasswordToken" TEXT;
