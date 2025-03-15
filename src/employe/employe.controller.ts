import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeService } from './employe.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { UpdateEmployeDto } from './dto/update-employe.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Employés')
@Controller('employes')
export class EmployeController {
  constructor(private readonly employeService: EmployeService) {}

  // ✅ Créer un employé
  @Post()
  create(@Body() createEmployeDto: CreateEmployeDto) {
    return this.employeService.create(createEmployeDto);
  }

  // ✅ Récupérer tous les employés
  @Get()
  @ApiBearerAuth() // Ajoute un bouton "Authorize" dans Swagger
  @UseGuards(JwtAuthGuard) // Protège toutes les routes de ce contrôleur
  findAll() {
    return this.employeService.findAll();
  }

  // ✅ Récupérer un employé par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeService.findOne(id);
  }

  // ✅ Mettre à jour un employé
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeDto: UpdateEmployeDto) {
    return this.employeService.update(id, updateEmployeDto);
  }

  // ✅ Supprimer un employé
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeService.remove(id);
  }

  // ✅ Obtenir le solde de congés d'un employé
  @Get(':employeId/solde-conges')
  async getSoldeConges(@Param('employeId') employeId: string) {
    return this.employeService.getSoldeConges(employeId);
  }

  // ✅ Obtenir les heures de travail et heures supplémentaires d'un employé sur une période
  @Get(':employeId/heures-travail/periode')
  async getHeuresTravailSurPeriode(
    @Param('employeId') employeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.employeService.getHeuresTravailSurPeriode(employeId, start, end);
  }

  // ✅ Obtenir l'historique des absences d'un employé (congés approuvés)
  @Get(':employeId/historique-absences')
  async getHistoriqueAbsences(@Param('employeId') employeId: string) {
    return this.employeService.getHistoriqueAbsences(employeId);
  }

  // ✅ Obtenir les notifications d'un employé
  @Get(':employeId/notifications')
  async getNotifications(@Param('employeId') employeId: string) {
    return this.employeService.getNotifications(employeId);
  }

  // ✅ Récupérer les employés d'un responsable
  @Get('responsable/:responsableId/employes')
  async findEmployesByResponsable(@Param('responsableId') responsableId: string) {
    return this.employeService.findByResponsable(responsableId);
  }
}
