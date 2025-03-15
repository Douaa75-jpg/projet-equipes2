-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('PRESENT', 'ABSENT', 'RETARD');

-- AlterTable
ALTER TABLE "Pointage" ADD COLUMN     "statut" "Statut" NOT NULL DEFAULT 'ABSENT';
