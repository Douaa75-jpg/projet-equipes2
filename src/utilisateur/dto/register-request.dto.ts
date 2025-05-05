import { IsEmail, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TypeResponsable } from './create-utilisateur.dto';

export class RegisterRequestDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsEmail()
  email: string;

  @IsEnum(['EMPLOYE', 'RESPONSABLE', 'ADMINISTRATEUR'])
  role: string;

  @IsOptional()
  @IsDateString()
  datedenaissance?: string;

  @IsOptional()
  @IsString()
  matricule?: string;

  @IsOptional()
  @IsEnum(TypeResponsable)
  typeResponsable?: TypeResponsable;
}