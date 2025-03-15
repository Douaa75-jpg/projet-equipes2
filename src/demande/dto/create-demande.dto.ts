import { IsEnum, IsDate, IsOptional, IsString } from 'class-validator';
import { StatutDemande } from '@prisma/client';

export class CreateDemandeDto {
  @IsString()
  employeId: string;  // On ajoute l'ID de l'employé

  @IsString()
  type: string;  // Ajoute le type de la demande

  @IsDate()
  dateDebut: Date;

  @IsOptional()
  @IsDate()
  dateFin?: Date;

  @IsEnum(StatutDemande)
  statut: StatutDemande;

  @IsOptional()  // Optionnel si la raison est fournie
  @IsString()
  raison?: string;
}
