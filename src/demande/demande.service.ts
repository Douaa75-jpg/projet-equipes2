import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { NotificationGateway } from '../notifications/notifications.gateway';
import { StatutDemande } from '@prisma/client';


export enum TypeDemande {
  CONGE = 'CONGE', // تغيير من 'congé' إلى 'CONGE'
  ABSENCE = 'ABSENCE',
  AUTORISATION_SORTIE = 'AUTORISATION_SORTIE'
}

@Injectable()
export class DemandeService {
  private readonly DEFAULT_ANNUAL_LEAVE = 22; // 22 jours de congé par an

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway
  ) {}

  private notifyUser(userId: string, message: string) {
    this.notificationGateway.sendNotification(userId, message);
  }

  private async notifyRhAboutRequest(employeId: string, type: string) {
    const rh = await this.prisma.responsable.findFirst({
      where: { typeResponsable: 'RH' },
    });
    const employe = await this.prisma.employe.findUnique({
      where: { id: employeId },
      include: { utilisateur: true },
    });

    if (rh && employe) {
      this.notifyUser(
        rh.id,
        `📌 Nouvelle demande de ${type} soumise par ${employe.utilisateur.nom}`
      );
    }
  }

  private async calculateLeaveDays(dateDebut: Date, dateFin?: Date | null): Promise<number> {
    if (!dateFin) return 1;
    
    const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private async updateSoldeConges(employeId: string, days: number, operation: 'add' | 'subtract') {
    const employe = await this.prisma.employe.findUnique({ where: { id: employeId } });
    
    if (!employe) throw new NotFoundException("Employé non trouvé");

    const newSolde = operation === 'add' 
      ? employe.soldeConges + days 
      : employe.soldeConges - days;

    if (newSolde < 0) {
      throw new BadRequestException("Solde de congés insuffisant");
    }

    return this.prisma.employe.update({
      where: { id: employeId },
      data: { soldeConges: newSolde }
    });
  }



  async create(createDemandeDto: CreateDemandeDto) {
    const employe = await this.prisma.employe.findUnique({
      where: { id: createDemandeDto.employeId }
    });
  
    if (!employe) {
      throw new NotFoundException("L'employé n'existe pas.");
    }

    if (employe.soldeConges === null) {
      await this.prisma.employe.update({
        where: { id: createDemandeDto.employeId },
        data: { soldeConges: this.DEFAULT_ANNUAL_LEAVE }
      });
    }
  
    const dateDebut = new Date(createDemandeDto.dateDebut);
    if (isNaN(dateDebut.getTime())) {
      throw new BadRequestException("La date de début est invalide.");
    }
  
    const dateFin = createDemandeDto.dateFin ? new Date(createDemandeDto.dateFin) : null;
    if (dateFin && isNaN(dateFin.getTime())) {
      throw new BadRequestException("La date de fin est invalide.");
    }
  
    if (dateFin && dateFin < dateDebut) {
      throw new BadRequestException("La date de fin ne peut pas être antérieure à la date de début.");
    }
  
    const today = new Date();
    if (dateDebut <= today) {
      throw new BadRequestException("La date de début doit être future.");
    }

    // Gestion du solde pour les congés
    if (createDemandeDto.type === TypeDemande.CONGE) {
      const days = await this.calculateLeaveDays(dateDebut, dateFin);
      if (employe.soldeConges < days) {
        throw new BadRequestException(`Solde insuffisant. Il vous reste ${employe.soldeConges} jours.`);
      }
      await this.updateSoldeConges(employe.id, days, 'subtract');
    }

    const demande = await this.prisma.demande.create({
      data: {
        employeId: createDemandeDto.employeId,
        type: createDemandeDto.type,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin ? dateFin.toISOString() : null,
        statut: StatutDemande.EN_ATTENTE,
        raison: createDemandeDto.raison,
      }
    });

    await this.notifyRhAboutRequest(employe.id, createDemandeDto.type);
    return demande;
  }

  async approve(id: string, userId: string) {
    const rh = await this.prisma.responsable.findFirst({
      where: { typeResponsable: 'RH' }
    });
    
    if (!rh || rh.id !== userId) {
      throw new BadRequestException("Non autorisé à approuver.");
    }

    const demande = await this.prisma.demande.update({
      where: { id },
      data: { statut: StatutDemande.APPROUVEE },
    });

    this.notifyUser(demande.employeId, `Votre demande a été approuvée !`);
    return demande;
  }

  async reject(id: string, userId: string, raison: string) {
    const rh = await this.prisma.responsable.findFirst({ 
      where: { typeResponsable: 'RH' } 
    });
    
    if (!rh || rh.id !== userId) {
      throw new BadRequestException("Non autorisé à rejeter.");
    }
  
    const demande = await this.prisma.demande.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException("Demande non trouvée");
  
    // استرجاع الرصيد إذا كان طلب إجازة بغض النظر عن حالته
    if (demande.type === TypeDemande.CONGE) {
      const days = await this.calculateLeaveDays(new Date(demande.dateDebut), 
        demande.dateFin ? new Date(demande.dateFin) : undefined);
      await this.updateSoldeConges(demande.employeId, days, 'add');
    }
  
    const updatedDemande = await this.prisma.demande.update({
      where: { id },
      data: { 
        statut: StatutDemande.REJETEE,
        raison: raison 
      },
    });
  
    this.notifyUser(demande.employeId, `Votre demande a été rejetée. Raison : ${raison}`);
    return updatedDemande;
  }

  async remove(id: string, userId: string) {
    const demande = await this.prisma.demande.findUnique({ where: { id } });
    
    if (!demande) throw new NotFoundException("Demande non trouvée");
    if (demande.employeId !== userId) {
      throw new BadRequestException("Non autorisé à supprimer cette demande.");
    }
    if (demande.statut !== StatutDemande.EN_ATTENTE) {
      throw new BadRequestException("Seules les demandes en attente peuvent être supprimées.");
    }

    // Remboursement du solde si c'est un congé
    if (demande.type === TypeDemande.CONGE) {
      const days = await this.calculateLeaveDays(new Date(demande.dateDebut), 
        demande.dateFin ? new Date(demande.dateFin) : undefined);
      await this.updateSoldeConges(demande.employeId, days, 'add');
    }

    await this.prisma.demande.delete({ where: { id } });
    return { message: "✅ Demande supprimée avec succès." };
  }

  async getSoldeConges(employeId: string) {
    const employe = await this.prisma.employe.findUnique({
      where: { id: employeId },
      select: { soldeConges: true }
    });
    
    return { 
      soldeConges: employe?.soldeConges ?? this.DEFAULT_ANNUAL_LEAVE
    };
  }

  async getLeaveHistory(employeId: string) {
    return this.prisma.demande.findMany({
      where: {
        employeId,
        type: TypeDemande.CONGE,
        statut: StatutDemande.APPROUVEE
      },
      orderBy: { dateDebut: 'desc' },
      select: {
        id: true,
        dateDebut: true,
        dateFin: true,
        statut: true,
        type: true
      }
    });
  }

  async resetAnnualLeave(employeId: string) {
    return this.prisma.employe.update({
      where: { id: employeId },
      data: { soldeConges: this.DEFAULT_ANNUAL_LEAVE }
    });
  }

  async update(id: string, data: Partial<CreateDemandeDto>, userId: string) {
    const demande = await this.prisma.demande.findUnique({ where: { id } });

    if (!demande) throw new NotFoundException("Demande non trouvée");
    if (demande.statut !== StatutDemande.EN_ATTENTE) {
      throw new BadRequestException("Seules les demandes en attente peuvent être modifiées.");
    }
    if (demande.employeId !== userId) {
      throw new BadRequestException("Non autorisé à modifier cette demande.");
    }

    // Gestion des dates
    const dateDebut = data.dateDebut ? new Date(data.dateDebut) : new Date(demande.dateDebut);
    const dateFin = data.dateFin ? new Date(data.dateFin) : (demande.dateFin ? new Date(demande.dateFin) : null);

    if (isNaN(dateDebut.getTime())) throw new BadRequestException("Date de début invalide");
    if (dateFin && isNaN(dateFin.getTime())) throw new BadRequestException("Date de fin invalide");
    if (dateFin && dateFin < dateDebut) {
      throw new BadRequestException("La date de fin ne peut pas être antérieure à la date de début.");
    }

    // Gestion du solde si c'est un congé
    if (demande.type === TypeDemande.CONGE) {
      const oldDays = await this.calculateLeaveDays(new Date(demande.dateDebut), 
        demande.dateFin ? new Date(demande.dateFin) : undefined);
      
      const newDays = await this.calculateLeaveDays(dateDebut, dateFin);
      
      if (newDays !== oldDays) {
        // Remboursement des anciens jours
        await this.updateSoldeConges(demande.employeId, oldDays, 'add');
        
        // Vérification et soustraction des nouveaux jours
        const employe = await this.prisma.employe.findUnique({ where: { id: demande.employeId } });
        if (employe && employe.soldeConges < newDays) {
          throw new BadRequestException(`Solde insuffisant. Il vous reste ${employe.soldeConges} jours.`);
        }
        await this.updateSoldeConges(demande.employeId, newDays, 'subtract');
      }
    }

    // Supprimer userId des données à mettre à jour
    const { userId: _, ...updateData } = data;

    return this.prisma.demande.update({
      where: { id },
      data: {
        ...updateData,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin ? dateFin.toISOString() : null
      },
    });
  }

  // في DemandeService
async findAll(page: number, limit: number) {
  return this.prisma.demande.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { dateDebut: 'desc' },
    include: {
      employe: {
        include: {
          utilisateur: true
        }
      }
    }
  });
}

async findOne(id: string) {
  const demande = await this.prisma.demande.findUnique({
    where: { id },
    include: {
      employe: {
        include: {
          utilisateur: true
        }
      }
    }
  });
  if (!demande) throw new NotFoundException("Demande non trouvée");
  return demande;
}
}