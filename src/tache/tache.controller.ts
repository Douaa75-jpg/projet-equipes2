import { Controller, Post, Get, Patch, Delete, Body, Param,HttpException,HttpStatus} from '@nestjs/common';
import { TacheService } from './tache.service';
import { ApiTags, ApiOperation, ApiResponse ,ApiParam, ApiBody} from '@nestjs/swagger';
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
  @ApiParam({ name: 'employeId', required: true, description: 'ID de l\'employé' })
  getByEmploye(@Param('employeId') employeId: string) {
    return this.tacheService.getTachesByEmploye(employeId);
  }

 // 🟡 Récupérer une tâche par ID (utile parfois pour détails)
 @Get('detail/:id')
 @ApiOperation({ summary: 'Récupérer une tâche par son ID' })
 @ApiResponse({ status: 200, description: 'Tâche trouvée.' })
 @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
 @ApiParam({ name: 'id', required: true, description: 'ID de la tâche' })
 getById(@Param('id') id: string) {
   return this.tacheService.getTacheById(id);
 }


  // 🟠 Mettre à jour une tâche
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiParam({ name: 'id', required: true, description: 'ID de la tâche à modifier' })
  @ApiBody({
    description: 'Champs modifiables pour une tâche',
    schema: {
      type: 'object',
      properties: {
        statut: { type: 'string', enum: ['A_FAIRE', 'EN_COURS', 'TERMINEE'] },
        titre: { type: 'string' },
        description: { type: 'string' },
        dateLimite: { type: 'string', format: 'date-time' },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body()
    data: {
      statut?: StatutTache;
      titre?: string;
      description?: string;
      dateLimite?: string;
    },
  ) {
    return this.tacheService.updateTache(id, data);
  }


   // 🔴 Supprimer une tâche
   @Delete(':id')
   @ApiOperation({ summary: 'Supprimer une tâche' })
   @ApiResponse({ status: 200, description: 'Tâche supprimée.' })
   @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
   @ApiParam({ name: 'id', required: true, description: 'ID de la tâche à supprimer' })
   delete(@Param('id') id: string) {
     return this.tacheService.deleteTache(id);
   }
 }
