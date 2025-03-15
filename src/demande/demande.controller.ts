import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';

@Controller('demande')
export class DemandeController {
  constructor(private readonly demandeService: DemandeService) {}

  @Post()
  create(@Body() createDemandeDto: CreateDemandeDto) {
    return this.demandeService.create(createDemandeDto);
  }

  @Get()
  findAll() {
    return this.demandeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDemandeDto: UpdateDemandeDto) {
    return this.demandeService.update(id, updateDemandeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandeService.remove(id);
  }
}
