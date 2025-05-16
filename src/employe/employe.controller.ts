import { Controller, Get, Post, Body, Patch, Param, Delete, Query, InternalServerErrorException ,NotFoundException} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeService } from './employe.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { UpdateEmployeDto } from './dto/update-employe.dto';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Employés')

@ApiBearerAuth() // Ajout de l'authentification via JWT
@Controller('employes')
export class EmployeController {
  constructor(private readonly employeService: EmployeService, 
    private readonly prisma: PrismaService,
  ) {}


  // ✅ Récupérer tous les employés
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les employés' })
  @ApiResponse({ status: 200, description: 'Liste des employés récupérée avec succès.' })
  async findAll() {
    return this.employeService.findAll();
  }

  // ✅ Récupérer un employé par ID
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un employé par ID' })
  @ApiResponse({ status: 200, description: 'L\'employé trouvé avec succès.' })
  @ApiResponse({ status: 404, description: 'Employé non trouvé.' })
  async findOne(@Param('id') id: string) {
    return this.employeService.findOne(id);
  }

  // ✅ Mettre à jour un employé
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un employé' })
  @ApiResponse({ status: 200, description: 'L\'employé a été mis à jour avec succès.' })
  async update(@Param('id') id: string, @Body() updateEmployeDto: UpdateEmployeDto) {
    return this.employeService.update(id, updateEmployeDto);
  }

  // ✅ Supprimer un employé
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un employé' })
  @ApiResponse({ status: 200, description: 'Employé supprimé avec succès.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  async remove(@Param('id') id: string) {
    try {
      return await this.employeService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la suppression de l\'employé');
    }
  }


  // ✅ Obtenir le solde de congés d'un employé
  @Get(':employeId/solde-conges')
  @ApiOperation({ summary: 'Obtenir le solde de congés d\'un employé' })
  @ApiResponse({ status: 200, description: 'Solde de congés récupéré avec succès.' })
  async getSoldeConges(@Param('employeId') employeId: string) {
    return this.employeService.getSoldeConges(employeId);
  }

  // ✅ Obtenir les heures de travail et heures supplémentaires d'un employé sur une période
  @Get(':employeId/heures-travail/periode')
  @ApiOperation({ summary: 'Obtenir les heures de travail sur une période' })
  @ApiResponse({ status: 200, description: 'Heures de travail récupérées avec succès.' })
  async getHeuresTravailSurPeriode(
    @Param('employeId') employeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.employeService.getHeuresTravailSurPeriode(employeId, start, end);
  }

  // ✅ Obtenir les notifications d'un employé
  @Get(':employeId/notifications')
  @ApiOperation({ summary: 'Obtenir les notifications d\'un employé' })
  @ApiResponse({ status: 200, description: 'Notifications récupérées avec succès.' })
  async getNotifications(@Param('employeId') employeId: string) {
    return this.employeService.getNotifications(employeId);
  }

  // ✅ Récupérer les employés d'un responsable
  @Get('responsable/:responsableId/employes')
  @ApiOperation({ summary: 'Récupérer les employés d\'un responsable' })
  @ApiResponse({ status: 200, description: 'Liste des employés du responsable récupérée avec succès.' })
  async findEmployesByResponsable(@Param('responsableId') responsableId: string) {
    const responsable = await this.prisma.responsable.findUnique({
      where: { id: responsableId },
      include: {
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        employes: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
    });
  
    if (!responsable) {
      throw new NotFoundException('Responsable non trouvé');
    }
  
    return responsable;
  }
  


    // ✅ Calculate employee absences
  @Get(':id/calculate-absences')
  @ApiOperation({ summary: 'Calculate and update employee absences' })
  @ApiResponse({ status: 200, description: 'Employee absences calculated and updated successfully.', schema: { example: { nbAbsences: 4 } } })
  async calculateAbsences(@Param('id') id: string) {
    try {
      const result = await this.employeService.calculerEtMettreAJourToutesLesAbsences(id);
      return result; // 👈 يرجع { nbAbsences: X }
    } catch (error) {
      throw new InternalServerErrorException('Failed to calculate absences: ' + error.message);
    }
  }
  
 }


