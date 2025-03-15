import { Controller, Post, Body,Get,Param} from '@nestjs/common';
import { AdministrateurService } from './administrateur.service';
import { CreateAdministrateurDto } from './dto/create-administrateur.dto';

@Controller('administrateur')
export class AdministrateurController {
  constructor(private readonly administrateurService: AdministrateurService) {}

  @Post()
  async create(@Body() createAdministrateurDto: CreateAdministrateurDto) {
    return this.administrateurService.create(createAdministrateurDto);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.administrateurService.findOne(id);
  }
}
