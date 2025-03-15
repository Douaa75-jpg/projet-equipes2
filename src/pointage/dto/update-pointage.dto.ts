import { IsOptional, IsDateString } from 'class-validator';

export class UpdatePointageDto {
  @IsDateString()
  @IsOptional()
  heureDepart?: string;
}
