import { PartialType } from '@nestjs/swagger';
import { CreateDemandeApprobationDto } from './create-approbation.dto';

export class UpdateApprobationDto extends PartialType(CreateDemandeApprobationDto) {}
