import { IsNotEmpty, IsOptional, IsUUID, IsDateString ,IsDate,IsEnum} from 'class-validator';
import { Statut } from '@prisma/client';


export class CreatePointageDto {
  @IsUUID()
  @IsNotEmpty()
  employeId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsDateString()
  @IsNotEmpty()
  heureArrivee: string;

  @IsDate()
  @IsOptional()
  heureDepart?: Date;

  @IsEnum(Statut)
  @IsOptional()
  statut: Statut;
}
