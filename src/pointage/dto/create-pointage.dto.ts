import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePointageDto {
  @ApiProperty({
    description: "ID de l'employé",
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  employeId: string;

  @ApiProperty({
    description: 'Date du pointage (au format YYYY-MM-DD)',
    example: '2023-05-15'
  })
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Heure du pointage (au format HH:MM:SS)',
    example: '08:30:00'
  })
  @IsNotEmpty()
  heure: string;

  @ApiProperty({
    description: 'Type de pointage (ENTREE ou SORTIE)',
    enum: ['ENTREE', 'SORTIE'],
    example: 'ENTREE'
  })
  @IsNotEmpty()
  type: 'ENTREE' | 'SORTIE';
}