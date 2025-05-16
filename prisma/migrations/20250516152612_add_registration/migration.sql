/*
  Warnings:

  - You are about to drop the column `entrepriseId` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the `Entreprise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Utilisateur" DROP CONSTRAINT "Utilisateur_entrepriseId_fkey";

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "entrepriseId";

-- DropTable
DROP TABLE "Entreprise";
