/*
  Warnings:

  - A unique constraint covering the columns `[departementId]` on the table `Responsable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Responsable" ADD COLUMN     "departementId" TEXT;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "departementId" TEXT;

-- CreateTable
CREATE TABLE "Departement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "responsableId" TEXT,

    CONSTRAINT "Departement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departement_nom_key" ON "Departement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Departement_responsableId_key" ON "Departement"("responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "Responsable_departementId_key" ON "Responsable"("departementId");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departement" ADD CONSTRAINT "Departement_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
