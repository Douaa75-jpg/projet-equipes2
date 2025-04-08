import { IsEmail, IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class CreateEmployeDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsEmail()
  email: string;

  @IsString()
  motDePasse: string;

  @IsUUID()
  @IsOptional()
  responsableId?: string  | null; // Optionnel, seulement si l'employé a un responsable

  @IsOptional()
  @IsDateString()
  dateDeNaissance?: string; 

  @IsOptional()
  @IsString()
  matricule?: string;
}
