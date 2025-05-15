import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApprobationService } from './approbation.service';
import { CreateDemandeApprobationDto } from './dto/create-approbation.dto';
import { ReponseApprobationDto } from './dto/reponse-approbation.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('approbations')
export class ApprobationController {
  constructor(private readonly approbationService: ApprobationService) {}

  @Post('demande')
  async creerDemande(@Body() createDemandeApprobationDto: CreateDemandeApprobationDto) {
    return this.approbationService.creerDemande(createDemandeApprobationDto);
  }

  @Post('approuver')
  @Roles(Role.RESPONSABLE)
  async approuver(@Body() reponseApprobationDto: ReponseApprobationDto) {
    if (!reponseApprobationDto.commentaire) {
      reponseApprobationDto.commentaire = '';
    }
    return this.approbationService.approuverUtilisateur(
      reponseApprobationDto.utilisateurId,
      'responsable-id', // Vous devrez récupérer l'ID du responsable à partir du token JWT
      reponseApprobationDto.commentaire,
    );
  }

  @Post('rejeter')
  @Roles(Role.RESPONSABLE)
  async rejeter(@Body() reponseApprobationDto: ReponseApprobationDto) {
    if (!reponseApprobationDto.commentaire) {
      reponseApprobationDto.commentaire = '';
    }
    return this.approbationService.rejeterUtilisateur(
      reponseApprobationDto.utilisateurId,
      'responsable-id', // Vous devrez récupérer l'ID du responsable à partir du token JWT
      reponseApprobationDto.commentaire,
    );
  }

  @Get('en-attente')
  @Roles(Role.RESPONSABLE)
  async getDemandesEnAttente() {
    return this.approbationService.getDemandesEnAttente();
  }

  @Get('historique')
  @Roles(Role.RESPONSABLE)
  async getHistorique() {
    return this.approbationService.getHistoriqueApprobations();
  }
}