/*
  Warnings:

  - You are about to drop the column `utilisateurId` on the `Responsable` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Responsable" DROP CONSTRAINT "Responsable_utilisateurId_fkey";

-- DropIndex
DROP INDEX "Responsable_utilisateurId_key";

-- AlterTable
ALTER TABLE "Responsable" DROP COLUMN "utilisateurId";

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
