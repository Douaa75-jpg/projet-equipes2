import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { UpdateEmployeDto } from './dto/update-employe.dto';
import { ResponsableService } from '../responsable/responsable.service';
import * as bcrypt from 'bcrypt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Employés')
@Injectable()
export class EmployeService {
  constructor(private prisma: PrismaService, private readonly responsableService: ResponsableService) {}

  // ✅ Créer un nouvel employé
  @ApiOperation({ summary: 'Créer un nouvel employé' })
  @ApiResponse({ status: 201, description: 'Employé créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Email déjà utilisé.' })
  async create(createEmployeDto: CreateEmployeDto) {
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: createEmployeDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    const hashedPassword = await bcrypt.hash(createEmployeDto.motDePasse, 10);

    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        nom: createEmployeDto.nom,
        prenom: createEmployeDto.prenom,
        email: createEmployeDto.email,
        motDePasse: hashedPassword,
        role: 'EMPLOYE',
        datedenaissance: createEmployeDto.dateDeNaissance ? new Date(createEmployeDto.dateDeNaissance) : null, 
        matricule: createEmployeDto.matricule || null,
      },
    });

    const employe = await this.prisma.employe.create({
      data: {
        id: utilisateur.id,
        responsableId: createEmployeDto.responsableId || null,
      },
      select: {
        id: true,
        responsableId: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            matricule: true, // Ajout du matricule
            datedenaissance: true,
          },
        },
      },
    });

    return employe;
  }

  // Trouver tous les employés
  @ApiOperation({ summary: 'Trouver tous les employés' })
  @ApiResponse({ status: 200, description: 'Liste des employés récupérée avec succès.' })
  async findAll() {
    return this.prisma.employe.findMany({
      select: {
        id: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            matricule: true, // Ajout du matricule
            datedenaissance: true,
          },
        },
        responsable: {
          select: {
            id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                matricule: true,
              },
            },
          },
        },
      },
    });
  }

  // Trouver un employé par ID
  @ApiOperation({ summary: 'Trouver un employé par ID' })
  @ApiResponse({ status: 200, description: 'Employé trouvé avec succès.' })
  @ApiResponse({ status: 404, description: 'Employé non trouvé.' })
  async findOne(id: string) {
    const employe = await this.prisma.employe.findUnique({
      where: { id },
      select: {
        id: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            matricule: true, // Ajout du matricule
            datedenaissance: true,
          },
        },
        responsable: {
          select: {
            id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                matricule: true,
              },
            },
          },
        },
      },
    });

    if (!employe) {
      throw new NotFoundException('Employé non trouvé');
    }

    return employe;
  }

  // ✅ Mettre à jour un employé
  @ApiOperation({ summary: 'Mettre à jour un employé' })
  @ApiResponse({ status: 200, description: 'Employé mis à jour avec succès.' })
  async update(id: string, updateEmployeDto: UpdateEmployeDto) {
    if (updateEmployeDto.responsableId) {
      const responsable = await this.prisma.responsable.findUnique({
        where: { id: updateEmployeDto.responsableId },
      });

      if (!responsable) {
        throw new NotFoundException('Responsable non trouvé.');
      }
    }

    return this.prisma.employe.update({
      where: { id },
      data: {
        utilisateur: {
          update: {
            nom: updateEmployeDto.nom,
            prenom: updateEmployeDto.prenom,
            email: updateEmployeDto.email,
            motDePasse: updateEmployeDto.motDePasse,
            datedenaissance: updateEmployeDto.dateDeNaissance ? new Date(updateEmployeDto.dateDeNaissance) : null, 
            matricule: updateEmployeDto.matricule || null,
          },
        },
        responsable: updateEmployeDto.responsableId
          ? {
              connect: { id: updateEmployeDto.responsableId },
            }
          : undefined,
      },
      select: {
        id: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            matricule: true, // Ajout du matricule
            datedenaissance: true,
          },
        },
        responsable: {
          select: {
            id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });
  }

  // ✅ Supprimer un employé
  @ApiResponse({ status: 200, description: 'Employé supprimé avec succès.' })
  async remove(id: string) {
    try {
      // Vérifier si l'employé existe avant de procéder à la suppression
      const employe = await this.prisma.employe.findUnique({
        where: { id },
      });
  
      if (!employe) {
        throw new NotFoundException("Employé non trouvé");
      }
  
      // Séparer l'employé du responsable
      await this.prisma.employe.update({
        where: { id },
        data: { responsableId: null },
      });
  
      // Supprimer les enregistrements associés
      await this.prisma.pointage.deleteMany({ where: { employeId: id } });
      await this.prisma.demande.deleteMany({ where: { employeId: id } });
      await this.prisma.notification.deleteMany({ where: { employeId: id } });
  
      // Supprimer l'employé
      await this.prisma.employe.delete({
        where: { id },
      });
  
      return { message: "Employé supprimé avec succès" };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      throw new InternalServerErrorException('Erreur lors de la suppression de l\'employé');
    }
  }
  

  // ✅ Obtenir le solde des congés
  @ApiOperation({ summary: 'Obtenir le solde des congés d\'un employé' })
  @ApiResponse({ status: 200, description: 'Solde des congés récupéré avec succès.' })
  async getSoldeConges(employeId: string) {
    const employe = await this.prisma.employe.findUnique({
      where: { id: employeId },
      select: { soldeConges: true },
    });

    if (!employe) {
      throw new NotFoundException("Employé non trouvé");
    }

    return { soldeConges: employe.soldeConges };
  }

  // ✅ Mettre à jour le solde des congés lors de l'approbation d'une demande
  @ApiOperation({ summary: 'Mettre à jour le solde des congés' })
  @ApiResponse({ status: 200, description: 'Solde des congés mis à jour avec succès.' })
  async updateSoldeConges(employeId: string, demandeId: string) {
    const demande = await this.prisma.demande.findUnique({
      where: { id: demandeId },
    });

    if (!demande) {
      throw new NotFoundException('Demande de congé non trouvée');
    }

    if (demande.statut !== 'APPROUVEE') {
      throw new BadRequestException('La demande de congé n\'est pas approuvée');
    }

    if (!demande.dateDebut || !demande.dateFin) {
      throw new BadRequestException('Les dates de début ou de fin ne sont pas valides');
    }

    const joursPris = Math.ceil(
      (new Date(demande.dateFin).getTime() - new Date(demande.dateDebut).getTime()) / (1000 * 3600 * 24)
    );

    const employe = await this.prisma.employe.findUnique({
      where: { id: employeId },
    });

    if (!employe) {
      throw new NotFoundException("Employé non trouvé");
    }

    return this.prisma.employe.update({
      where: { id: employeId },
      data: {
        soldeConges: employe.soldeConges - joursPris,
      },
    });
  }
  // ✅ Obtenir les heures de travail et les heures supplémentaires sur une période
  async getHeuresTravailSurPeriode(employeId: string, startDate: Date, endDate: Date) {
    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let heuresTravail = 0;
    let heuresSupp = 0;

    pointages.forEach((pointage) => {
      if (pointage.heureDepart && pointage.heureArrivee) {
        const heures = (pointage.heureDepart.getTime() - pointage.heureArrivee.getTime()) / (1000 * 60 * 60);
        heuresTravail += heures;

        if (heures > 8) {
          heuresSupp += heures - 8;
        }
      }
    });

    // Mise à jour des heures de travail et des heures supplémentaires de l'employé
    await this.prisma.employe.update({
      where: { id: employeId },
      data: {
        heuresTravail: heuresTravail,
        heuresSupp: heuresSupp,
      },
    });

    return { heuresTravail, heuresSupp };
  } 
 // ✅ Obtenir l'historique des absences
  async getHistoriqueAbsences(employeId: string) {
    return this.prisma.demande.findMany({
      where: { employeId, statut: "APPROUVEE" },
      select: { id: true, type: true, dateDebut: true, dateFin: true },
    });
  }

  // ✅ Obtenir les notifications de l'employé
  async getNotifications(employeId: string) {
    return this.prisma.notification.findMany({
      where: { employeId },
      select: { id: true, message: true, dateEnvoi: true },
      orderBy: { dateEnvoi: 'desc' },
    });
  }

  // ✅ Récupérer les employés d'un responsable
  @ApiOperation({ summary: 'Récupérer les employés d\'un responsable' })
@ApiResponse({ status: 200, description: 'Liste des employés récupérée avec succès.' })
async findByResponsable(responsableId: string) {
  return this.prisma.responsable.findUnique({
    where: { id: responsableId },
    include: {
      utilisateur: {
        select: {
          nom: true,
          prenom: true,
          email: true,
          matricule: true, // Ajout du matricule
          datedenaissance: true,
        },
      },
      employes: {
        include: {
          utilisateur: {
            select: {
              nom: true,
              prenom: true,
              email: true,
              matricule: true, // Ajout du matricule
              datedenaissance: true,
            },
          },
        },
      },
    },
  });
}


}