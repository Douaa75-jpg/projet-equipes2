import { IsOptional, IsDateString , IsISO8601 , IsString} from 'class-validator';

export class UpdatePointageDto {
  @IsDateString()
  @IsOptional()
  heureDepart?: string;

  @IsOptional()
  @IsISO8601()
  heureDepartDej?: string;

  @IsOptional()
  @IsISO8601()
  heureRetourDej?: string;


  @IsOptional()
  @IsISO8601()
  heureArrivee?: string;
  
  @IsOptional()
  @IsString()
  statut?: string;  // Ajout du statut

  @IsOptional()
  @IsString()
  nom?: string;  // Ajout du nom

  @IsOptional()
  @IsString()
  prenom?: string;
}
