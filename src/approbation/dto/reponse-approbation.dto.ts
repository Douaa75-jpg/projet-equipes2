import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReponseApprobationDto {
  @IsString()
  @IsNotEmpty()
  utilisateurId: string;

  @IsString()
  @IsOptional()
  commentaire?: string;
}