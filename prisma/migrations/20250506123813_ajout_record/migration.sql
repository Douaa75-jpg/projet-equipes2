-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "action" INTEGER NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Record_utilisateurId_idx" ON "Record"("utilisateurId");

-- CreateIndex
CREATE INDEX "Record_time_idx" ON "Record"("time");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
