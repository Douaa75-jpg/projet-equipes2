/*
  Warnings:

  - You are about to drop the `demandes_inscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutDemandeInscription" AS ENUM ('APPROUVEE', 'REJETEE', 'EN_ATTENTE');

-- DropForeignKey
ALTER TABLE "demandes_inscription" DROP CONSTRAINT "demandes_inscription_utilisateurCreeId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "demandes_inscription";

-- DropEnum
DROP TYPE "StatutInscription";

-- CreateTable
CREATE TABLE "DemandeInscription" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "statut" "StatutDemandeInscription" NOT NULL DEFAULT 'EN_ATTENTE',
    "demandeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3),

    CONSTRAINT "DemandeInscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemandeInscription_utilisateurId_key" ON "DemandeInscription"("utilisateurId");

-- AddForeignKey
ALTER TABLE "DemandeInscription" ADD CONSTRAINT "DemandeInscription_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
