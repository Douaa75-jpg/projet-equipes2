import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { NotificationGateway } from '../notifications/notifications.gateway';

@Injectable()
export class DemandeService {
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

  // Création d'une demande
  async create(createDemandeDto: CreateDemandeDto) {
    console.log("Date envoyée :", createDemandeDto.dateDebut);
    console.log("Date actuelle UTC :", new Date(Date.now()).toISOString());
  
    const employe = await this.prisma.employe.findUnique({
      where: { id: createDemandeDto.employeId },
      include: { responsable: true },
    });
  
    if (!employe) {
      console.log(`Employé avec ID ${createDemandeDto.employeId} non trouvé`);
      throw new NotFoundException("L'employé n'existe pas.");
    }
  
    const dateDebut = new Date(createDemandeDto.dateDebut);
    // Assurez-vous que le format de la date soit correct (incluant l'heure)
    if (isNaN(dateDebut.getTime())) {
      throw new BadRequestException("La date de début est invalide.");
    }
  
    // Extraction de la date de fin (si présente) et mise à zéro de l'heure
    const dateFin = createDemandeDto.dateFin ? new Date(createDemandeDto.dateFin) : null;
    if (dateFin && isNaN(dateFin.getTime())) {
      throw new BadRequestException("La date de fin est invalide.");
    }
  
    // Vérification que la date de fin est après la date de début
    if (dateFin && dateFin < dateDebut) {
      throw new BadRequestException("La date de fin ne peut pas être antérieure à la date de début.");
    }
  
    // Vérification que la date de début est dans le futur
    const today = new Date();
    if (dateDebut <= today) {
      throw new BadRequestException("La date de début doit être future.");
    }

   // Création de la demande dans la base de données
    const demande = await this.prisma.demande.create({
      data: {
        employeId: createDemandeDto.employeId,
        type: createDemandeDto.type,
        dateDebut: dateDebut.toISOString(),  // Format complet ISO
        dateFin: dateFin ? dateFin.toISOString() : null, 
        statut: createDemandeDto.statut,
        raison: createDemandeDto.raison,
      }
    });

  
    // Notification à la RH concernant la nouvelle demande
    await this.notifyRhAboutRequest(employe.id, createDemandeDto.type);
  
    return demande;
  }
  
  



  // Approuver une demande
  async approve(id: string, userId: string) {
    const rh = await this.prisma.responsable.findFirst({
       where: { typeResponsable: 'RH' }
      });
    if (!rh || rh.id !== userId) {
      throw new BadRequestException("Vous n'êtes pas autorisé à approuver cette demande.");
    }

    const demande = await this.prisma.demande.update({
      where: { id },
      data: { statut: 'APPROUVEE' },
    });

    this.notifyUser(demande.employeId, ` Votre demande a été approuvée !`);
    return demande;
  }

  // Rejeter une demande
  async reject(id: string, userId: string , raison:string) {
    const rh = await this.prisma.responsable.findFirst({ where: { typeResponsable: 'RH' } });
    if (!rh || rh.id !== userId) {
      throw new BadRequestException("Vous n'êtes pas autorisé à rejeter cette demande.");
    }

    const demande = await this.prisma.demande.update({
      where: { id },
      data: { statut: 'REJETEE' , raison: raison },
    });

    this.notifyUser(demande.employeId, ` Votre demande a été rejetée.Raison : ${raison}`);
    return demande;
  }


  // Récupérer toutes les demandes avec pagination
  async findAll(page: number = 1, limit: number = 10) {
    const demandes = await this.prisma.demande.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { dateDebut: 'desc' },
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        }
      },
    });
    const total = await this.prisma.demande.count();
    return { total, page, limit, demandes };
  }
  

  // Récupérer une demande par ID
  async findOne(id: string) {
    const demande = await this.prisma.demande.findUnique({
      where: { id },
      include: {
        employe: {
          include: {
            utilisateur: true
          }
        }
      },
    });
    if (!demande) throw new NotFoundException("La demande n'existe pas.");
    return demande;
  }
    

  // Supprimer une demande
  async remove(id: string, userId: string) {
    const demande = await this.prisma.demande.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException("La demande n'existe pas.");
    if (demande.statut !== 'SOUMISE') {
      throw new BadRequestException("Impossible de supprimer une demande déjà traitée.");
    }
    if (demande.employeId !== userId) {
      throw new BadRequestException("Vous n'êtes pas autorisé à supprimer cette demande.");
    }
    await this.prisma.demande.delete({ where: { id } });
    return { message: "✅ Demande supprimée avec succès." };
  }
}
