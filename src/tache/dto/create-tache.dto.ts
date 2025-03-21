import { IsString, IsOptional, IsEnum, IsDateString,IsUUID , IsDate} from 'class-validator';

export enum StatutTache {
  A_FAIRE = "A_FAIRE",
  EN_COURS = "EN_COURS",
  TERMINEE = "TERMINEE",
}

export class CreateTacheDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  employeId: string;

  @IsOptional()
  @IsEnum(StatutTache)
  statut?: StatutTache;

  @IsOptional()
  @IsDateString()
  dateLimite?: string;
}
