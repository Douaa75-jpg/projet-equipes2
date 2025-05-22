import { Controller,BadRequestException, Get, Post, Body, Param, Request, Put, Delete, Patch } from '@nestjs/common';
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
  async assignerResponsable(
    @Param('id') id: string,
    @Body() responsableIdDto: { responsableId: string }
  ) {
    return this.utilisateursService.assignerResponsable(id, responsableIdDto.responsableId);
  }

  

  // Récupérer tous les utilisateurs
  @Get('chefs-equipe')
@ApiOperation({ summary: 'Obtenir tous les chefs d\'équipe' })
@ApiResponse({ 
  status: 200, 
  description: 'Liste des chefs d\'équipe récupérée avec succès',
  type: [CreateUtilisateurDto]
})
async findChefsEquipe() {
  const chefs = await this.utilisateursService.findChefsEquipe();
  return chefs.map(chef => ({
    id: chef.id,
    nom: chef.nom,
    prenom: chef.prenom,
    email: chef.email,
    matricule: chef.matricule,
    datedenaissance: chef.datedenaissance
  }));
}

  // Récupérer un utilisateur par ID
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les employés' })
  @ApiResponse({ status: 200, description: 'Liste des employés récupérée avec succès.' })
  async findMany() {
    return this.utilisateursService.findMany();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() updateUtilisateurDto: UpdateUtilisateurDto
  ) {
    return this.utilisateursService.update(id, updateUtilisateurDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
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
