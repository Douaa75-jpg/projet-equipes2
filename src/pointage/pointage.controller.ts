import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PointageService } from './pointage.service';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { UpdatePointageDto } from './dto/update-pointage.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Pointages')
@Controller('pointages')
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un pointage (arrivée ou absence)' })
  create(@Body() createPointageDto: CreatePointageDto) {
    return this.pointageService.create(createPointageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les pointages' })
  findAll() {
    return this.pointageService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un pointage par ID' })
  findOne(@Param('id') id: string) {
    return this.pointageService.findOne(id);
  }

  @Get('absences/:employeId')
  @ApiOperation({ summary: 'Récupérer le nombre d\'absences' })
  async getAbsences(@Param('employeId') employeId: string): Promise<{ absences: number }> {
    const absences = await this.pointageService.getNbAbsences(employeId);
    return { absences }; // Retourne le nombre d'absences
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
    @Param('employeId') employeId: string,
    @Param('dateDebut') dateDebut: string,
    @Param('dateFin') dateFin: string
  ) {
    return this.pointageService.calculerHeuresTravail(employeId, dateDebut, dateFin);
  }

  // ✅ Nouvelle méthode pour enregistrer la pause déjeuner
  @Patch('pause-dejeuner/:id')
  @ApiOperation({ summary: 'Enregistrer les heures de pause déjeuner' })
  async enregistrerPauseDejeuner(
    @Param('id') id: string,
    @Body() updatePointageDto: UpdatePointageDto
  ) {
    return this.pointageService.enregistrerPauseDejeuner(id, updatePointageDto);
  }
}
