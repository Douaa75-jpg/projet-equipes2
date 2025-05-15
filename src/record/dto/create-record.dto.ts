import { IsInt, IsISO8601 } from 'class-validator';

export class CreateRecordDto {
  @IsInt()
  user: number;

  @IsISO8601()
  time: Date;

  @IsInt()
  action: number;
}