import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { CreateDemandeDto } from './dto/create-demande.dto';

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

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('userId') userId: string) {
    return this.demandeService.approve(id, userId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('userId') userId: string) {
    return this.demandeService.reject(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandeService.remove(id);
  }
}
