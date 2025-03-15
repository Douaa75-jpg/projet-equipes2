import { IsEnum, IsOptional } from 'class-validator';
import { StatutDemande } from '@prisma/client';

export class UpdateDemandeDto {
  @IsOptional()
  @IsEnum(StatutDemande)
  statut?: StatutDemande;
}
