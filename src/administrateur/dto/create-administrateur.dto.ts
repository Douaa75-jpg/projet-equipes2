import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAdministrateurDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  utilisateurId: string;  // ID de l'utilisateur qui sera l'administrateur
}
