import { Controller, Get, Post, Body, Param, Request, Put, Delete, Patch } from '@nestjs/common';
import { UtilisateursService } from './utilisateur.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Utilisateurs')
@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  // Créer un nouvel utilisateur (employé, responsable, administrateur)
  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  async create(@Body() createUtilisateurDto: CreateUtilisateurDto) {
    return this.utilisateursService.create(createUtilisateurDto);
  }

  // Assigner un responsable (chef d'équipe) à un employé
  @Patch(':id/assigner-responsable')
  @ApiOperation({ summary: 'Assigner un responsable (chef d\'équipe) à un employé' })
  @ApiResponse({ status: 200, description: 'Responsable assigné avec succès' })
  @ApiBody({
    description: 'Assignation d\'un responsable à un employé',
    type: Object,
    schema: {
      example: {
        responsableId: 'uuid-du-responsable',
      },
    },
  })
  async assignerResponsable(
    @Param('id') id: string,
    @Body() responsableIdDto: { responsableId: string }
  ) {
    return this.utilisateursService.assignerResponsable(id, responsableIdDto.responsableId);
  }

  // Récupérer tous les utilisateurs
  @Get()
  @ApiOperation({ summary: 'Obtenir tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
  async findAll(@Request() req) {
    console.log('Utilisateur Authentifié:', req.user);
    return this.utilisateursService.findAll();
  }

  // Récupérer un utilisateur par ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès' })
  async findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(id);
  }

  // Mettre à jour un utilisateur
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour avec succès' })
  async update(@Param('id') id: string, @Body() updateUtilisateurDto: UpdateUtilisateurDto) {
    return this.utilisateursService.update(id, updateUtilisateurDto);
  }

  // Supprimer un utilisateur
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  async remove(@Param('id') id: string) {
    return this.utilisateursService.remove(id);
  }

  // Récupérer le nombre total d'employés
  @Get('count/employes')
  @ApiOperation({ summary: 'Obtenir le nombre total d\'employés' })
  @ApiResponse({ status: 200, description: 'Nombre total d\'employés récupéré avec succès' })
  async countEmployes() {
    return { totalEmployes: await this.utilisateursService.countEmployes() };
  }

  // Récupérer le nombre total de responsables
  @Get('count/responsables')
  @ApiOperation({ summary: 'Obtenir le nombre total de responsables(CHEF_EQUIPE)' })
  @ApiResponse({ status: 200, description: 'Nombre total de responsables récupéré avec succès' })
  async countResponsables() {
    return { totalResponsables: await this.utilisateursService.countResponsables() };
  }
}
