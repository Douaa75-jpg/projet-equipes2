/*
  Warnings:

  - A unique constraint covering the columns `[utilisateurId]` on the table `Responsable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `utilisateurId` to the `Responsable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Responsable" DROP CONSTRAINT "Responsable_id_fkey";

-- AlterTable
ALTER TABLE "Responsable" ADD COLUMN     "utilisateurId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Responsable_utilisateurId_key" ON "Responsable"("utilisateurId");

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
