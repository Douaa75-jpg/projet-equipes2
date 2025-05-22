import { Controller, HttpStatus,Get,HttpException, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { NotificationService } from '../notifications/notifications.service';

@Controller('demande')
export class DemandeController {
  constructor(private readonly demandeService: DemandeService , private notificationService: NotificationService,
   ) {}

  @Post()
  async create(@Body() createDemandeDto: CreateDemandeDto) {
    try {
      const demande = await this.demandeService.create(createDemandeDto);
      return {
        success: true,
        data: demande
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.demandeService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandeService.findOne(id);
  }

 // dans votre contrôleur
 @Get(':id/solde')
  async getSolde(@Param('id') employeId: string) {
    try {
      const result = await this.demandeService.getSoldeConges(employeId);
      return {
        success: true,
        soldeConges: result.soldeConges
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get(':id/historique')
  getHistorique(@Param('id') employeId: string) {
    return this.demandeService.getLeaveHistory(employeId);
  }

  @Post(':id/reset-solde')
  resetSolde(@Param('id') employeId: string) {
    return this.demandeService.resetAnnualLeave(employeId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('userId') userId: string) {
    return this.demandeService.approve(id, userId);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string, 
    @Body('userId') userId: string,
    @Body('raison') raison: string
  ) {
    return this.demandeService.reject(id, userId, raison);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.demandeService.remove(id, userId);
  }

  @Patch(':id')
async update(
  @Param('id') id: string,
  @Body() data: Partial<CreateDemandeDto>,
  @Body('userId') userId: string
) {
  try {
    const result = await this.demandeService.update(id, data, userId);
    return {
      success: true,
      data: result
    };
  } catch (e) {
    throw new HttpException({
      success: false,
      message: e.message
    }, HttpStatus.BAD_REQUEST);
  }
}

  
@Get('equipe/en-conge/:responsableId')
async getTeamLeaveRequests(@Param('responsableId') responsableId: string) {
  return this.demandeService.getTeamLeaveRequests(responsableId);
}


// Dans DemandeController
@Get('equipe/conges-a-venir/:responsableId')
async getUpcomingTeamLeaveRequests(@Param('responsableId') responsableId: string) {
  return this.demandeService.getUpcomingTeamLeaveRequests(responsableId);
}

@Get('conges/a-venir')
async getUpcomingLeaves() {
  return this.demandeService.getUpcomingLeaves();
}


// في DemandeController
@Get('jours-feries')
async getJoursFeries(@Query('year') year: number) {
  const holidays = [
    { nom: "Nouvel An", date: new Date(year, 0, 1), estFerie: true },
      { nom: "Fête de la Révolution", date: new Date(year, 0, 14), estFerie: true },
      { nom: "Fête de l'Indépendance", date: new Date(year, 3, 9), estFerie: true },
      { nom: "Fête du Travail", date: new Date(year, 4, 1), estFerie: true },
      { nom: "Fête de la République", date: new Date(year, 6, 25), estFerie: true },
      { nom: "Fête de la Femme", date: new Date(year, 7, 13), estFerie: true },
      { nom: "Fête de l'Évacuation", date: new Date(year, 11, 18), estFerie: true },
  ];
  return holidays;
}
}