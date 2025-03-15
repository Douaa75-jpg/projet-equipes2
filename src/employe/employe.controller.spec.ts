// employe.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmployeService } from './employe.service';

@Controller('employes')
export class EmployeController {
  constructor(private readonly employeService: EmployeService) {}

  // Route pour obtenir et mettre à jour les heures de travail et les heures supplémentaires
  @Get(':id/heures-travail/periode')
  async getHeuresTravail(
    @Param('id') employeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Appel au service pour calculer et mettre à jour les heures de travail et les heures supplémentaires
    return await this.employeService.getHeuresTravailSurPeriode(employeId, startDateObj, endDateObj);
  }
}
