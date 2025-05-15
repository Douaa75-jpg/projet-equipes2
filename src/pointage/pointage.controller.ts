import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PointageService } from './pointage.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import moment from 'moment-timezone';

@ApiTags('pointages')
@Controller('pointages')
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Post(':employeId')
  @ApiOperation({ summary: 'Enregistrer un pointage (entrée/sortie)' })
  @ApiParam({ name: 'employeId', description: 'ID de l\'employé' })
  @ApiResponse({ status: 201, description: 'Pointage enregistré avec succès' })
  async enregistrerPointage(@Param('employeId') employeId: string) {
    return this.pointageService.enregistrerPointage(employeId);
  }

  @Get('heures-travail/:employeId')
  @ApiOperation({ summary: 'Calculer les heures travaillées' })
  @ApiParam({ name: 'employeId', description: 'ID de l\'employé' })
  @ApiResponse({ status: 200, description: 'Heures travaillées calculées' })
  async calculerHeuresTravail(
    @Param('employeId') employeId: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    return this.pointageService.calculerHeuresTravail(employeId, dateDebut, dateFin);
  }

  @Get('historique/:employeId')
  async getHistorique(
    @Param('employeId') employeId: string,
    @Query('date') date: string
  ) {
    try {
      const historique = await this.pointageService.getHistorique(employeId, date);
      return historique || []; // Retourne une liste vide si historique est null/undefined
    } catch (e) {
      return []; // Retourne une liste vide en cas d'erreur
    }
  }

  @Get('heures-equipe/:chefId')
  @ApiOperation({ summary: 'Obtenir les heures travaillées pour toute l\'équipe' })
  async getHeuresEquipe(@Param('chefId') chefId: string) {
    return this.pointageService.getHeuresEquipe(chefId);
  }

@Get('heures-journalieres/:employeId')
  @ApiOperation({ summary: 'Calculer les heures travaillées pour un jour donné' })
  async getHeuresJournalieres(
    @Param('employeId') employeId: string,
    @Query('date') date: string
  ) {
    return this.pointageService.getHeuresJournalieres(employeId, date);
  }
  @Get('heures-travail-equipe/:chefId')
  @ApiOperation({ summary: 'Rapport des heures travaillées pour tous les employés' })
  async getHeuresTravailTousLesEmployes(
    @Param('chefId') chefId: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string
  ) {
    return this.pointageService.getHeuresTravailTousLesEmployes(chefId, dateDebut, dateFin);
  }

  @Get('historique-equipe/:chefId')
  @ApiOperation({ summary: 'Historique des pointages pour toute l\'équipe avec pagination' })
  async getHistoriqueEquipe(
    @Param('chefId') chefId: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('employeId') employeId?: string
  ) {
    return this.pointageService.getHistoriqueEquipe(chefId, {
      dateDebut,
      dateFin,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type: type as 'ENTREE' | 'SORTIE',
      employeId
    });
  }

  @Get('employes')
  @ApiOperation({ summary: 'Liste de tous les employés' })
  async getEmployesList() {
    return this.pointageService.getEmployesList();
  }


  @Get('employe-info/:employeId')
@ApiOperation({ summary: 'Obtenir les informations détaillées d\'un employé' })
@ApiResponse({ 
  status: 200, 
  description: 'Informations de l\'employé récupérées avec succès' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Employé non trouvé' 
})
async getEmployeInfo(@Param('employeId') employeId: string) {
  return this.pointageService.getEmployeInfo(employeId);
}


@Get(':chefId/nombre-employes')
  async getNombreEmployesSousResponsable(@Param('chefId') chefId: string) {
    const count = await this.pointageService.countEmployesSousChef(chefId);
    return { nombreEmployes: count };
  }



  // Dans pointage.controller.ts

@Get('weekly-hours-chart/:employeId')
@ApiOperation({ summary: 'Données pour le graphique des heures hebdomadaires' })
async getWeeklyHoursChart(
  @Param('employeId') employeId: string,
  @Query('dateDebut') dateDebut: string
) {
  return this.pointageService.getWeeklyHoursChartData(employeId, dateDebut);
}


@Get('attendance-distribution/:employeId')
@ApiOperation({ summary: 'Répartition des états de présence' })
async getAttendanceDistribution(
  @Param('employeId') employeId: string,
  @Query('dateDebut') dateDebut: string,
  @Query('dateFin') dateFin: string
) {
  return this.pointageService.getAttendanceDistribution(employeId, dateDebut, dateFin);
}


// Nouveaux endpoints
@Get('presences-aujourdhui/:employeId')
  @ApiOperation({ summary: 'Nombre de présences aujourd\'hui pour un employé spécifique' })
  @ApiParam({ name: 'employeId', description: 'ID de l\'employé' })
  async getPresenceEmployeAujourdhui(@Param('employeId') employeId: string) {
    return {
      count: await this.pointageService.getNombreEmployesPresentAujourdhui(employeId),
      date: moment().tz('Africa/Tunis').format('YYYY-MM-DD')
    };
  }

  @Get('presences-aujourdhui')
  @ApiOperation({ summary: 'Nombre total de présences aujourd\'hui' })
  async getPresencesAujourdhui() {
    return {
      count: await this.pointageService.getNombreEmployesPresentAujourdhui(),
      date: moment().tz('Africa/Tunis').format('YYYY-MM-DD')
    };
  }

  @Get('presence-weekday/all')
  @ApiOperation({ summary: 'Taux de présence par jour de la semaine pour tous les employés' })
  async getPresenceByWeekdayForAll(
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string
  ) {
    return this.pointageService.getPresenceByWeekdayForAllEmployees(dateDebut, dateFin);
  }
}