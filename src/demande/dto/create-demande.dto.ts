import { IsEnum, IsDateString, IsOptional, IsString, MinDate } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutDemande } from '@prisma/client';

export enum TypeDemande {
  CONGE = 'congé',
  ABSENCE = 'absence',
  AUTORISATION_SORTIE = 'autorization_sortie'
  
}

export class CreateDemandeDto {
  @IsString()
  employeId: string;

  @IsEnum(TypeDemande)
  type: TypeDemande;

  @IsDateString({}, { message: "La date de début doit être une date valide au format ISO 8601." })
  dateDebut: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsEnum(StatutDemande)
  statut: StatutDemande = StatutDemande.SOUMISE;

  @IsOptional()
  @IsString()
  raison?: string;
}
