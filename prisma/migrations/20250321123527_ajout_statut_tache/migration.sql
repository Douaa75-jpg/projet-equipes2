/*
  Warnings:

  - The `statut` column on the `Tache` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatutTache" AS ENUM ('A_FAIRE', 'EN_COURS', 'TERMINEE');

-- AlterTable
ALTER TABLE "Tache" DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutTache" NOT NULL DEFAULT 'A_FAIRE';
