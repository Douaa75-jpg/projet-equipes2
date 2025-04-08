import { IsString, IsEmail, IsEnum, MinLength, IsOptional, IsDateString } from 'class-validator';
import { TypeResponsable } from '@prisma/client'; // Assurez-vous que l'énum est bien importée de Prisma
import { ApiProperty } from '@nestjs/swagger';


export class CreateResponsableDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  prenom: string;


  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: TypeResponsable })
  @IsEnum(TypeResponsable)
  typeResponsable: TypeResponsable;


  @ApiProperty()
  @IsString()
  @MinLength(6)  // Optionnel : pour imposer une longueur minimale au mot de passe
  motDePasse: string;  // Champ ajouté pour le mot de passe
 
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matricule?: string; // Champ matricule (optionnel)

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'La date de naissance doit être une date ISO valide' })
  dateDeNaissance?: Date; // Champ dateDeNaissance (optionnel)
}