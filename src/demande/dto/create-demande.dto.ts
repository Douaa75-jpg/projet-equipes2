import { IsEnum, IsDateString, IsOptional, IsString } from 'class-validator';
import { StatutDemande } from '@prisma/client';

export class CreateDemandeDto {
  @IsString()
  employeId: string;  

  @IsString()
  type: string;  

  @IsDateString() // ✅ Accepte uniquement "YYYY-MM-DD"
  dateDebut: string;

  @IsOptional()
  @IsDateString() // ✅ Accepte uniquement "YYYY-MM-DD"
  dateFin?: string;

  @IsEnum(StatutDemande)
  statut: StatutDemande = StatutDemande.SOUMISE;

  @IsOptional()  
  @IsString()
  raison?: string;
}
