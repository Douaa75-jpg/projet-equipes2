/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Pointage` table. All the data in the column will be lost.
  - You are about to drop the column `heureArrivee` on the `Pointage` table. All the data in the column will be lost.
  - You are about to drop the column `heureDepart` on the `Pointage` table. All the data in the column will be lost.
  - You are about to drop the column `heureDepartDej` on the `Pointage` table. All the data in the column will be lost.
  - You are about to drop the column `heureRetourDej` on the `Pointage` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Pointage` table. All the data in the column will be lost.
  - Added the required column `heure` to the `Pointage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Pointage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PointageType" AS ENUM ('ENTREE', 'SORTIE');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_responsableId_fkey";

-- DropForeignKey
ALTER TABLE "Responsable" DROP CONSTRAINT "Responsable_id_fkey";

-- AlterTable
ALTER TABLE "Pointage" DROP COLUMN "deletedAt",
DROP COLUMN "heureArrivee",
DROP COLUMN "heureDepart",
DROP COLUMN "heureDepartDej",
DROP COLUMN "heureRetourDej",
DROP COLUMN "statut",
ADD COLUMN     "heure" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "PointageType" NOT NULL;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- CreateIndex
CREATE INDEX "Pointage_employeId_date_idx" ON "Pointage"("employeId", "date");

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Responsable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
