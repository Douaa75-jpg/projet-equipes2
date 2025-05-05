/*
  Warnings:

  - The `status` column on the `Utilisateur` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE');

-- CreateEnum
CREATE TYPE "StatutApprobation" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE');

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "status",
ADD COLUMN     "status" "StatutUtilisateur" NOT NULL DEFAULT 'EN_ATTENTE';

-- CreateTable
CREATE TABLE "ApprobationRH" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateApprobation" TIMESTAMP(3),
    "statut" "StatutApprobation" NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaire" TEXT,

    CONSTRAINT "ApprobationRH_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApprobationRH" ADD CONSTRAINT "ApprobationRH_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprobationRH" ADD CONSTRAINT "ApprobationRH_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
