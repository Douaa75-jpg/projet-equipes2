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
  async remove(id: string) {
    return await this.prisma.$transaction(async (prisma) => {
      // 1. التحقق من وجود الموظف
      const employe = await prisma.employe.findUnique({
        where: { id },
        include: { utilisateur: true }
      });
  
      if (!employe) {
        throw new NotFoundException("Employé non trouvé");
      }
  
      // 2. حذف جميع السجلات المرتبطة
      await prisma.pointage.deleteMany({ where: { employeId: id } });
      await prisma.demande.deleteMany({ where: { employeId: id } });
      await prisma.notification.deleteMany({ where: { employeId: id } });
      await prisma.tache.deleteMany({ where: { employeId: id } });
  
      // 3. حذف الموظف نفسه
      await prisma.employe.delete({ where: { id } });
  
      // 4. التعامل مع المستخدم المرتبط
      const userRelations = await prisma.utilisateur.findUnique({
        where: { id },
        select: {
          responsable: true,
          administrateur: true
        }
      });
  
      // التحقق من وجود userRelations بشكل صحيح
      if (!userRelations) {
        // إذا لم يتم العثور على المستخدم، نتابع دون حذف
        return { message: "Employé supprimé (utilisateur non trouvé)" };
      }
  
      // التحقق من العلاقات الأخرى
      const hasOtherRoles = userRelations.responsable || userRelations.administrateur;
  
      if (!hasOtherRoles) {
        // لا توجد أدوار أخرى - حذف المستخدم
        await prisma.utilisateur.delete({ where: { id } });
      } else {
        // يوجد أدوار أخرى - فصل علاقة الموظف فقط
        await prisma.utilisateur.update({
          where: { id },
          data: {
            employe: { disconnect: true },
            role: employe.utilisateur.role === 'EMPLOYE' ? 
                 (userRelations.responsable ? 'RESPONSABLE' : 'ADMINISTRATEUR') : 
                 employe.utilisateur.role
          }
        });
      }
  
      return { message: "Employé supprimé avec succès et toutes ses données associées" };
    }).catch((error) => {
      console.error('Erreur lors de la suppression:', error);
      throw new InternalServerErrorException(
        'Échec de la suppression de l\'employé: ' + error.message
      );
    });
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
  // Get all pointages for the employee in the given period
  const pointages = await this.prisma.pointage.findMany({
    where: {
      employeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  let heuresTravail = 0;
  let heuresSupp = 0;

  // Group pointages by date
  const pointagesByDate: Record<string, {entree?: Date, sortie?: Date}> = {};

  pointages.forEach((pointage) => {
    const dateKey = pointage.date.toISOString().split('T')[0];
    if (!pointagesByDate[dateKey]) {
      pointagesByDate[dateKey] = {};
    }
    
    if (pointage.type === 'ENTREE') {
      pointagesByDate[dateKey].entree = pointage.heure;
    } else if (pointage.type === 'SORTIE') {
      pointagesByDate[dateKey].sortie = pointage.heure;
    }
  });

  // Calculate working hours for each day
  for (const dateKey in pointagesByDate) {
    const { entree, sortie } = pointagesByDate[dateKey];
    
    if (entree && sortie) {
      // Calculate hours worked (in hours)
      const heures = (sortie.getTime() - entree.getTime()) / (1000 * 60 * 60);
      heuresTravail += heures;

      // Calculate overtime (anything over 8 hours)
      if (heures > 8) {
        heuresSupp += heures - 8;
      }
    }
  }

  // Update employee's working hours and overtime
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

 
// ✅ Calculate and update employee absences
@ApiOperation({ summary: 'Calculer tous les jours d\'absence depuis la date d\'embauche' })
@ApiResponse({ status: 200, description: 'Tous les absences ont été calculés et mis à jour avec succès.' })
async calculerEtMettreAJourToutesLesAbsences(employeId: string): Promise<{ nbAbsences: number }> {
  // 1. نجيب بيانات الموظف
  const employe = await this.prisma.employe.findUnique({
    where: { id: employeId },
    include: {
      utilisateur: {
        select: { dateEmbauche: true }
      }
    }
  });

  if (!employe || !employe.utilisateur?.dateEmbauche) {
    throw new NotFoundException('Employé ou date d\'embauche non trouvé');
  }

  const dateEmbauche = new Date(employe.utilisateur.dateEmbauche);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // نحدد تاريخ اليوم من غير وقت

  let nbAbsences = 0;

  // 2. نحضّرو تواريخ جميع الأيام بين تاريخ التعيين واليوم
  for (let d = new Date(dateEmbauche); d <= today; d.setDate(d.getDate() + 1)) {
    const jour = new Date(d);
    jour.setHours(0, 0, 0, 0); // Normalize the time

    // 3. نتجنبو الويكاند (اختياري، حسب سياستكم)
    const isWeekend = jour.getDay() === 0 || jour.getDay() === 6; // الأحد = 0، السبت = 6
    if (isWeekend) continue;

    // 4. نشوفو إذا الموظف عمل نقطة دخول في النهار هذاك
    const pointage = await this.prisma.pointage.findFirst({
      where: {
        employeId,
        type: 'ENTREE',
        date: {
          gte: jour,
          lt: new Date(jour.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!pointage) {
      nbAbsences++;
    }
  }

  // 5. نحينو العدد في قاعدة البيانات
  await this.prisma.employe.update({
    where: { id: employeId },
    data: { nbAbsences },
  });

  return { nbAbsences };
}

}