import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutorisationSortieService } from './autorisation-sortie.service';
import { CreateAutorisationSortieDto } from './dto/create-autorisation-sortie.dto';
import { UpdateAutorisationSortieDto } from './dto/update-autorisation-sortie.dto';

@Controller('autorisation-sortie')
export class AutorisationSortieController {
  constructor(private readonly autorisationSortieService: AutorisationSortieService) {}

  @Post()
  create(@Body() createAutorisationSortieDto: CreateAutorisationSortieDto) {
    return this.autorisationSortieService.create(createAutorisationSortieDto);
  }

  @Get()
  findAll() {
    return this.autorisationSortieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorisationSortieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorisationSortieDto: UpdateAutorisationSortieDto) {
    return this.autorisationSortieService.update(+id, updateAutorisationSortieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorisationSortieService.remove(+id);
  }
}
