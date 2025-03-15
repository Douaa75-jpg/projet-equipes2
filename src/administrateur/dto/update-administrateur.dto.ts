import { PartialType } from '@nestjs/swagger';
import { CreateAdministrateurDto } from './create-administrateur.dto';

export class UpdateAdministrateurDto extends PartialType(CreateAdministrateurDto) {}
