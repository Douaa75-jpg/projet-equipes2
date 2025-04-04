// C:\projet-equipes\src\notification\dto\create-notification.dto.ts

import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
    @IsOptional()
    @IsString()
    employeId?: string;
  
    @IsOptional()
    @IsString()
    responsableId?: string;
  
    @IsString()
    message: string;
  }
  