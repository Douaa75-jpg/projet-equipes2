import { IsNotEmpty, IsOptional, IsUUID,IsISO8601, IsDateString ,IsDate,IsEnum} from 'class-validator';
import { Statut } from '@prisma/client';


export class CreatePointageDto {
  @IsUUID()
  @IsNotEmpty()
  employeId: string;

  @IsISO8601()
  @IsNotEmpty()
  date: string;

  @IsISO8601()
  @IsNotEmpty()
  heureArrivee: string;

  @IsOptional()
  @IsDateString()
  heureDepart?: string;

  @IsEnum(Statut)
  @IsOptional()
  statut: Statut;
}
