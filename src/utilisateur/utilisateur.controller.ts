import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UtilisateursService } from './utilisateur.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Utilisateurs')
@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  async create(@Body() createUtilisateurDto: CreateUtilisateurDto) {
    return this.utilisateursService.create(createUtilisateurDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
  async findAll() {
    return this.utilisateursService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès' })
  async findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour avec succès' })
  async update(@Param('id') id: string, @Body() updateUtilisateurDto: UpdateUtilisateurDto) {
    return this.utilisateursService.update(id, updateUtilisateurDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  async remove(@Param('id') id: string) {
    return this.utilisateursService.remove(id);
  }
}
