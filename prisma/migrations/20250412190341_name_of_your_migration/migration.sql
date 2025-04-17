-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE');

-- DropForeignKey
ALTER TABLE "Employe" DROP CONSTRAINT "Employe_responsableId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "lu" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "datedenaissance" DATE,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matricule" VARCHAR(255),
ADD COLUMN     "registrationToken" VARCHAR(255),
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "demandes_inscription" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "dateDeNaissance" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL,
    "typeResponsable" "TypeResponsable",
    "status" "StatutInscription" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurCreeId" TEXT,

    CONSTRAINT "demandes_inscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demandes_inscription_email_key" ON "demandes_inscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_inscription_utilisateurCreeId_key" ON "demandes_inscription"("utilisateurCreeId");

-- AddForeignKey
ALTER TABLE "demandes_inscription" ADD CONSTRAINT "demandes_inscription_utilisateurCreeId_fkey" FOREIGN KEY ("utilisateurCreeId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Responsable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
