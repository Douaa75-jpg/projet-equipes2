-- CreateTable
CREATE TABLE "Tache" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'A_FAIRE',

    CONSTRAINT "Tache_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
