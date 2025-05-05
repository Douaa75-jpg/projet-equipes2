import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../auth/role.enum';
import { TypeResponsable } from '../../utilisateur/dto/create-utilisateur.dto';

export class CreateDemandeApprobationDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsEnum(TypeResponsable)
  typeResponsable?: TypeResponsable;

  @IsOptional()
  responsableId?: string;
}