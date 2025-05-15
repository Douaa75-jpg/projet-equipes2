/*
  Warnings:

  - A unique constraint covering the columns `[pointeuseId]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "pointeuseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_pointeuseId_key" ON "Utilisateur"("pointeuseId");
