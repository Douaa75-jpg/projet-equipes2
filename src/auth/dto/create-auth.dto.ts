// create-auth.dto.ts
import { IsEmail, IsNotEmpty  } from 'class-validator';
import { Column } from 'typeorm';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  motDePasse: string;
  
  @Column()
  role: string;

}