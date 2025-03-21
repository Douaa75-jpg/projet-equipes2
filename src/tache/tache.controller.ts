import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { TacheService } from './tache.service';
import { ApiTags, ApiOperation, ApiResponse , ApiBody} from '@nestjs/swagger';
import { CreateTacheDto } from './dto/create-tache.dto';
import { StatutTache } from '@prisma/client'; // ou le chemin relatif correct


@ApiTags('Tâches')
@Controller('taches')
export class TacheController {
  constructor(private readonly tacheService: TacheService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  create(@Body() data: CreateTacheDto) {
    return this.tacheService.createTache(data);
  }

  @Get(':employeId')
  @ApiOperation({ summary: 'Récupérer les tâches d\'un employé' })
  @ApiResponse({ status: 200, description: 'Liste des tâches récupérée.' })
  getByEmploye(@Param('employeId') employeId: string) {
    return this.tacheService.getTachesByEmploye(employeId);
  }


@Patch(':id') // Endpoint لـ تحديث مهمة
@ApiOperation({ summary: 'Mettre à jour la tâche' })
@ApiResponse({ status: 200, description: 'Tâche mise à jour avec succès.' })
@ApiResponse({ status: 400, description: 'Requête invalide.' })
@ApiBody({
  description: 'Données de mise à jour pour la tâche',
  type: CreateTacheDto,  // Vous pouvez remplacer par le type que vous utilisez
  
})
update(
  @Param('id') id: string, 
  @Body() data: { statut?: StatutTache, titre?: string, description?: string, dateLimite?: string }
) {
  return this.tacheService.updateTache(id, data);
}



  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  delete(@Param('id') id: string) {
    return this.tacheService.deleteTache(id);
  }
}
