//DTO pour la réponse après authentification

import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'Token JWT' })
  access_token: string;
}
