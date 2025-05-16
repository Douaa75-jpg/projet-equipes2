/*
  Warnings:

  - Added the required column `entrepriseId` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "entrepriseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_code_key" ON "Entreprise"("code");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
