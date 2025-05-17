// src/auth/dto/reset-password.dto.ts
import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de réinitialisation' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ 
    description: 'Nouveau mot de passe', 
    minLength: 8,
    example: 'NouveauMotDePasse123!'
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}