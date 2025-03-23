-- DropForeignKey
ALTER TABLE "Employe" DROP CONSTRAINT "Employe_responsableId_fkey";

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Responsable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
