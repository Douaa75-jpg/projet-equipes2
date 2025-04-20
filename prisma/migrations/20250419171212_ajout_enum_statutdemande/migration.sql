/*
  Warnings:

  - The values [SOUMISE] on the enum `StatutDemande` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `DemandeInscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatutDemande_new" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE');
ALTER TABLE "Demande" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "Demande" ALTER COLUMN "statut" TYPE "StatutDemande_new" USING ("statut"::text::"StatutDemande_new");
ALTER TYPE "StatutDemande" RENAME TO "StatutDemande_old";
ALTER TYPE "StatutDemande_new" RENAME TO "StatutDemande";
DROP TYPE "StatutDemande_old";
ALTER TABLE "Demande" ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "DemandeInscription" DROP CONSTRAINT "DemandeInscription_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE';

-- DropTable
DROP TABLE "DemandeInscription";

-- DropEnum
DROP TYPE "StatutDemandeInscription";
