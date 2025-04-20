import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { CreateDemandeDto } from './dto/create-demande.dto';

@Controller('demande')
export class DemandeController {
  constructor(private readonly demandeService: DemandeService) {}

  
  @Post()
  create(@Body() createDemandeDto: CreateDemandeDto) {
    console.log("Date envoyée :", createDemandeDto.dateDebut);
    console.log("Date actuelle UTC :", new Date(Date.now()).toISOString());
    return this.demandeService.create(createDemandeDto);
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.demandeService.findAll(Number(page), Number(limit));
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
  reject(@Param('id') id: string, @Body('userId') userId: string , @Body('raison') raison: string) {
    return this.demandeService.reject(id, userId ,raison);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.demandeService.remove(id, userId);
  }

  
  @Patch(':id')
update(
  @Param('id') id: string,
  @Body() data: Partial<CreateDemandeDto>,
  @Body('userId') userId: string
) {
  return this.demandeService.update(id, data, userId);
}

}