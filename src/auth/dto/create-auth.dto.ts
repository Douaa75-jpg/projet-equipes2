//DTO pour la connexion (email & mot de passe)

import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  motDePasse: string;
}
