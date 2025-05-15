import { IsEnum, IsDateString, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutDemande } from '@prisma/client';

export enum TypeDemande {
  CONGE = 'CONGE', // تغيير من 'congé' إلى 'CONGE'
  AUTORISATION_SORTIE = 'AUTORISATION_SORTIE'
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
  statut: StatutDemande = StatutDemande.EN_ATTENTE;

  @IsOptional()
  @IsString()
  raison?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  soldeConges?: number;

  @IsOptional()
  @IsString()
  userId?: string;
  
}
