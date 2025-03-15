import { IsString, IsEmail, IsEnum , MinLength} from 'class-validator';
import { TypeResponsable } from '@prisma/client';

export class UpdateResponsableDto {
  @IsString()
  nom?: string;

  @IsString()
  prenom?: string;

  @IsEmail()
  email?: string;

  @IsEnum(TypeResponsable)
  typeResponsable?: TypeResponsable;

  @IsString()
  @MinLength(6)  // Optionnel : pour imposer une longueur minimale au mot de passe
    motDePasse: string;  // Champ ajouté pour le mot de passe
  
}
