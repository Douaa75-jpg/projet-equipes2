-- AlterTable
ALTER TABLE "Responsable" ADD COLUMN     "administrateurId" TEXT;

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES "Administrateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
