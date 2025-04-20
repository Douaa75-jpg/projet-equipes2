import { Controller,BadRequestException, Get, Post, Body, Patch, Param, Delete , Query } from '@nestjs/common';
import { PointageService } from './pointage.service';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { UpdatePointageDto } from './dto/update-pointage.dto';
import { ApiTags, ApiBody,ApiOperation } from '@nestjs/swagger';
import moment from 'moment';


@ApiTags('Pointages')
@Controller('pointages')
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un pointage (arrivée ou absence)' })
  create(@Body() createPointageDto: CreatePointageDto) {
    return this.pointageService.create(createPointageDto);
  }

  

  @Get('/test-cron')
  @ApiOperation({ summary: 'Tester le Cron Job manuellement' })
  async testCron() {
    await this.pointageService.enregistrerAbsences();
    return { message: '✅ Cron Job exécuté manuellement !' };
  }


  @Get()
  @ApiOperation({ summary: 'Récupérer tous les pointages' })
  findAll() {
    return this.pointageService.findAll();
  }

  @Get('historique/:employeId')
async getHistorique(@Param('employeId') employeId: string) {
  return this.pointageService.findAllByEmploye(employeId);
}


@Get(':employeId')
@ApiOperation({ summary: 'Récupérer un pointage par employeId et date' })
async getPointageByEmployeId(@Param('employeId') employeId: string, @Query('date') date: string) {
  return this.pointageService.getPointageByEmployeId(employeId, date);
}


  @Get('absences/:employeId')
  @ApiOperation({ summary: 'Récupérer le nombre d\'absences d\'un employé' })
  async getAbsences(@Param('employeId') employeId: string): Promise<{ absences: number }> {
    const absences = await this.pointageService.getNbAbsences(employeId);
    return { absences };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un pointage (enregistrer l\'heure de départ)' })
  update(@Param('id') id: string, @Body() updatePointageDto: UpdatePointageDto) {
    return this.pointageService.update(id, updatePointageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un pointage' })
  remove(@Param('id') id: string) {
    return this.pointageService.remove(id);
  }

  @Get('calcul-heures')
@ApiOperation({ summary: 'Calculer les heures de travail et les heures supplémentaires' })
async calculerHeuresTravail(
  @Query('employeId') employeId: string,
  @Query('dateDebut') dateDebut: string,
  @Query('dateFin') dateFin: string
){
  if (!employeId || !dateDebut || !dateFin) {
    throw new Error("Les paramètres 'employeId', 'dateDebut' et 'dateFin' sont requis.");
  }
  return this.pointageService.calculerHeuresTravail(employeId, dateDebut, dateFin);
}

  // Route pour enregistrer l'heure de départ
  @Patch('depart/:employeId')
@ApiOperation({ summary: 'Enregistrer l\'heure de départ d\'un employé' })
@ApiBody({
  description: 'Les données nécessaires pour enregistrer l\'heure de départ',
  type: Object,
  examples: {
    exemple: {
      value: {
        date: '2025-03-31',
        heureDepart: '17:30:00'
      },
      description: 'Exemple d\'heure de départ'
    }
  }
})
async enregistrerHeureDepart(
  @Param('employeId') employeId: string,
  @Body() body: { date: string, heureDepart: string }
) {
  return this.pointageService.enregistrerHeureDepart(employeId,body.date, body.heureDepart);
}

// Dans votre contrôleur par exemple
@Get('stats/presences-par-jour')
async getPresencesParJour(
  @Query('dateDebut') dateDebut: string,
  @Query('dateFin') dateFin: string,
) {
  return this.pointageService.getNombreEmployesPresentParJour(dateDebut, dateFin);
}


@Get('stats/presences-aujourdhui')
async getPresencesAujourdhui() {
  return this.pointageService.getNombreEmployesPresentAujourdhui();
}

@Get('absences/aujourdhui')
async getAbsencesAujourdhui() {
  return {
    nombreAbsents: await this.pointageService.getNombreEmployesAbsentAujourdhui(),
    date: moment().format('YYYY-MM-DD'),
  };
}
}
