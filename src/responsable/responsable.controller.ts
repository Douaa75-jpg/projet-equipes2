import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponsableService } from './responsable.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';

@ApiTags('Responsables')
@Controller('responsables')
export class ResponsableController {
  constructor(private readonly responsableService: ResponsableService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un responsable' })
  @ApiResponse({ status: 201, description: 'Le responsable a été créé.' })
  async create(@Body() createResponsableDto: CreateResponsableDto) {
    return this.responsableService.create(createResponsableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les responsables' })
  @ApiResponse({ status: 200, description: 'Liste des responsables.' })
  async findAll() {
    return this.responsableService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un responsable par ID' })
  @ApiResponse({ status: 200, description: 'Informations du responsable.' })
  async findOne(@Param('id') id: string) {
    return this.responsableService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un responsable' })
  @ApiResponse({ status: 200, description: 'Responsable mis à jour.' })
  async update(@Param('id') id: string, @Body() updateResponsableDto: UpdateResponsableDto) {
    return this.responsableService.update(id, updateResponsableDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un responsable' })
  @ApiResponse({ status: 200, description: 'Responsable supprimé.' })
  async remove(@Param('id') id: string) {
    return this.responsableService.remove(id);
  }
}
