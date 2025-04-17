import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum, MinLength, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { Role } from '@prisma/client'; // Assurez-vous que le rôle est importé correctement

export enum TypeResponsable {
  RH = 'RH',
  CHEF_EQUIPE = 'CHEF_EQUIPE',
}

export class UpdateUtilisateurDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ required: false, description: 'Le mot de passe de l\'utilisateur' })
  @IsString()
  @MinLength(6)
  @IsOptional()  // Permet de ne pas spécifier ce champ lors de la mise à jour
  motDePasse?: string;

  @IsOptional()
  @IsUUID()
  responsableId?: string;

  @ApiProperty({ required: false, description: 'Le matricule de l\'utilisateur' })
  @IsString()
  @IsOptional()  // Permet de ne pas spécifier ce champ lors de la mise à jour
  matricule?: string;

  @ApiProperty()
  @IsOptional()  // La date de naissance est optionnelle
  @IsDateString()  // Validation du format de la date
  dateDeNaissance?: string;

  @ApiProperty({ required: false, description: 'Type de responsable (RH ou CHEF_EQUIPE)' })
  @IsEnum(TypeResponsable)
  @IsOptional()  // Permet de ne pas spécifier ce champ lors de la mise à jour
  typeResponsable?: TypeResponsable;
}
