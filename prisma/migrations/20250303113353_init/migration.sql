-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYE', 'RESPONSABLE', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('SOUMISE', 'APPROUVEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "TypeResponsable" AS ENUM ('RH', 'CHEF_EQUIPE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employe" (
    "id" TEXT NOT NULL,
    "responsableId" TEXT,

    CONSTRAINT "Employe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsable" (
    "id" TEXT NOT NULL,
    "typeResponsable" "TypeResponsable",
    "administrateurId" TEXT,

    CONSTRAINT "Responsable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrateur" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pointage" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureArrivee" TIMESTAMP(3) NOT NULL,
    "heureDepart" TIMESTAMP(3),

    CONSTRAINT "Pointage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "statut" "StatutDemande" NOT NULL DEFAULT 'SOUMISE',

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "employeId" TEXT,
    "responsableId" TEXT,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Responsable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES "Administrateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrateur" ADD CONSTRAINT "Administrateur_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pointage" ADD CONSTRAINT "Pointage_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Responsable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
