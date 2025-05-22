/*
  Warnings:

  - You are about to drop the column `departementId` on the `Responsable` table. All the data in the column will be lost.
  - You are about to drop the column `departementId` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `registrationToken` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiresAt` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the `Departement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Departement" DROP CONSTRAINT "Departement_responsableId_fkey";

-- DropForeignKey
ALTER TABLE "Responsable" DROP CONSTRAINT "Responsable_departementId_fkey";

-- DropForeignKey
ALTER TABLE "Utilisateur" DROP CONSTRAINT "Utilisateur_departementId_fkey";

-- DropIndex
DROP INDEX "Responsable_departementId_key";

-- AlterTable
ALTER TABLE "Responsable" DROP COLUMN "departementId";

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "departementId",
DROP COLUMN "isActive",
DROP COLUMN "registrationToken",
DROP COLUMN "tokenExpiresAt";

-- DropTable
DROP TABLE "Departement";

-- DropEnum
DROP TYPE "Statut";
