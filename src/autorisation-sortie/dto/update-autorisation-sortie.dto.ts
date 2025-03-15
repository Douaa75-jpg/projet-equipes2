import { PartialType } from '@nestjs/swagger';
import { CreateAutorisationSortieDto } from './create-autorisation-sortie.dto';

export class UpdateAutorisationSortieDto extends PartialType(CreateAutorisationSortieDto) {}
