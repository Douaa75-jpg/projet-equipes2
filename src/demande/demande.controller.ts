import { Controller, HttpStatus,Get,HttpException, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { CreateDemandeDto } from './dto/create-demande.dto';

@Controller('demande')
export class DemandeController {
  constructor(private readonly demandeService: DemandeService) {}

  @Post()
  create(@Body() createDemandeDto: CreateDemandeDto) {
    return this.demandeService.create(createDemandeDto);
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
   const result = await this.demandeService.getSoldeConges(employeId);
   return {
     success: true,
     soldeConges: Number(result.soldeConges) // تأكد من التحويل لعدد
   };
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
    @Body() data: Partial<CreateDemandeDto> & { userId?: string },
    @Body('userId') userId: string
  ) {
    try {
      const result = await this.demandeService.update(id, { ...data, userId }, userId);
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
}