import { IsString,IsOptional,IsDateString, IsEmail, IsEnum , MinLength} from 'class-validator';
import { TypeResponsable } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateResponsableDto {
  @IsString()
  nom?: string;

  @IsString()
  prenom?: string;

  @IsEmail()
  email?: string;

  @IsEnum(TypeResponsable)
  typeResponsable?: TypeResponsable;

  @IsOptional()
  @IsString()
  @MinLength(6)  // Optionnel : pour imposer une longueur minimale au mot de passe
    motDePasse: string;  // Champ ajouté pour le mot de passe
  
     @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      matricule?: string; // Champ matricule (optionnel)
    
      @ApiProperty({ required: false })
      @IsOptional()
      @IsDateString({}, { message: 'La date de naissance doit être une date ISO valide (AAAA-MM-JJ)' })
      datedenaissance?: string;
}
