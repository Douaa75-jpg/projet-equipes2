// src/auth/dto/verify-company-code.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCompanyCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}