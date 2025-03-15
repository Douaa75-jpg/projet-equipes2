/*
  Warnings:

  - You are about to drop the column `administrateurId` on the `Responsable` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Responsable" DROP CONSTRAINT "Responsable_administrateurId_fkey";

-- AlterTable
ALTER TABLE "Responsable" DROP COLUMN "administrateurId";
