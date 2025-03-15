import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsEnum , IsString, MinLength} from 'class-validator';
import { Role } from '@prisma/client'; // Assurez-vous que le rôle est importé correctement

export class UpdateUtilisateurDto {
  @ApiProperty()
  @IsOptional()
  nom: string;

  @ApiProperty()
  @IsOptional()
  prenom: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role: Role;


  @IsString()
  @MinLength(6)  // Optionnel : pour imposer une longueur minimale au mot de passe
  motDePasse: string; 
}
