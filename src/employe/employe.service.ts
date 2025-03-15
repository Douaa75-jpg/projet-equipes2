// employe.service.ts
import { Injectable , BadRequestException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { UpdateEmployeDto } from './dto/update-employe.dto';
import { ResponsableService } from '../responsable/responsable.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeService {
  constructor(private prisma: PrismaService,
              private readonly responsableService: ResponsableService
             ) {}

  // ✅ Création d'un employé
  async create(createEmployeDto: CreateEmployeDto) {
    
    if (!createEmployeDto.responsableId) {
      throw new Error("id de responsable doit etre présent.");
    }
   
    // Vérifier si le responsable existe
    const responsable = await this.prisma.responsable.findUnique({
      where: { id: createEmployeDto.responsableId },
    });

    if (!responsable) {
      throw new Error('Responsable (chef d\'équipe) non trouvé.');
    }

    // Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(createEmployeDto.motDePasse, 10);

    return this.prisma.employe.create({
      data: {
        utilisateur: {
          create: {
            nom: createEmployeDto.nom,
            prenom: createEmployeDto.prenom,
            email: createEmployeDto.email,
            role: 'EMPLOYE', // Définir le rôle
            motDePasse: hashedPassword, // Ajouter le mot de passe
          },
        },
        responsable: {
          connect: {
            id: createEmployeDto.responsableId, // Lier à un responsable existant
          },
        },
      },
      select: {
        id: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
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
  
  // Trouver tous les employés
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

   // Trouver un employé par ID
   async findOne(id: string) {
    return this.prisma.employe.findUnique({
      where: { id },
      select: {
        id: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
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

  // ✅ Mettre à jour un employé
  async update(id: string, updateEmployeDto: UpdateEmployeDto) {
    // Vérifier si le responsable existe (si le responsableId est fourni)
    if (updateEmployeDto.responsableId) {
      const responsable = await this.prisma.responsable.findUnique({
        where: { id: updateEmployeDto.responsableId },
      });

      if (!responsable) {
        throw new Error('Responsable (chef d\'équipe) non trouvé.');
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
            motDePasse: updateEmployeDto.motDePasse, // Optionnel si modifié
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
  async remove(id: string) {
    return this.prisma.employe.delete({ where: { id } });
  }

  // ✅ Obtenir le solde des congés
  async getSoldeConges(employeId: string) {
    const employe = await this.prisma.employe.findUnique({
      where: { id: employeId },
      select: { soldeConges: true },
    });

    if (!employe) {
      throw new Error("Employé non trouvé");
    }

    return { soldeConges: employe.soldeConges };
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

   // Récupérer les employés d'un responsable
   async findByResponsable(responsableId: string) {
    return this.prisma.employe.findMany({
      where: {
        responsableId: responsableId,
      },
      include: {
        utilisateur: {  // Inclure les détails de l'utilisateur (nom, prénom, email)
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });
  }
  
}
