import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class DemandeService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway
  ) {}

  private notifyUser(userId: string, message: string) {
    this.notificationGateway.sendNotification(userId, message);
  }

  // Création d'une demande
  async create(createDemandeDto: CreateDemandeDto) {
    try {
      // Vérification de l'existence de l'employé
      const employe = await this.prisma.employe.findUnique({
        where: { id: createDemandeDto.employeId },
        include: { responsable: true }, // On récupère le responsable de l'employé
      });

      if (!employe) {
        throw new NotFoundException("L'employé n'existe pas.");
      }

      // Vérification que la date de fin n'est pas antérieure à la date de début
      const dateDebut = new Date(createDemandeDto.dateDebut + 'T00:00:00.000Z');
      const dateFin = createDemandeDto.dateFin
        ? new Date(createDemandeDto.dateFin + 'T00:00:00.000Z')
        : null;

      if (dateFin && dateFin < dateDebut) {
        throw new BadRequestException("La date de fin ne peut pas être antérieure à la date de début.");
      }

      // Création de la demande
      const demande = await this.prisma.demande.create({
        data: {
          ...createDemandeDto,
          dateDebut,
          dateFin,
        },
      });

      // Envoi de la notification au responsable si l'employé a un responsable
      if (employe.responsable) {
        this.notifyUser(
          employe.responsable.id,
          `📌 Nouvelle demande de ${createDemandeDto.type} soumise par ${employe.id}`
        );
      }

      return demande;
    } catch (error) {
      throw error;
    }
  }

  // Approuver une demande
  async approve(id: string, userId: string) {
    const demande = await this.prisma.demande.findUnique({
      where: { id },
      include: { employe: { include: { responsable: true } } },
    });

    if (!demande) throw new NotFoundException("La demande n'existe pas.");

    // Vérification que l'utilisateur (responsable) est bien celui qui est autorisé à approuver
    if (demande.employe.responsable?.id !== userId) {
      throw new BadRequestException("Vous n'êtes pas autorisé à approuver cette demande.");
    }

    const updated = await this.prisma.demande.update({
      where: { id },
      data: { statut: 'APPROUVEE' },
    });

    this.notifyUser(updated.employeId, `✅ Votre demande a été approuvée !`);
    return updated;
  }

  // Rejeter une demande
  async reject(id: string, userId: string) {
    const demande = await this.prisma.demande.findUnique({
      where: { id },
      include: { employe: { include: { responsable: true } } },
    });

    if (!demande) throw new NotFoundException("La demande n'existe pas.");

    // Vérification que l'utilisateur (responsable) est bien celui qui est autorisé à rejeter
    if (demande.employe.responsable?.id !== userId) {
      throw new BadRequestException("Vous n'êtes pas autorisé à rejeter cette demande.");
    }

    const updated = await this.prisma.demande.update({
      where: { id },
      data: { statut: 'REJETEE' },
    });

    this.notifyUser(updated.employeId, `❌ Votre demande a été rejetée.`);
    return updated;
  }

  // Récupérer toutes les demandes avec pagination
  async findAll(page: number = 1, limit: number = 10) {
    const demandes = await this.prisma.demande.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { dateDebut: 'desc' }, // Trier par date (du plus récent au plus ancien)
    });

    const total = await this.prisma.demande.count();
    return { total, page, limit, demandes };
  }

  // Récupérer une demande par ID
  async findOne(id: string) {
    const demande = await this.prisma.demande.findUnique({ where: { id } });

    if (!demande) {
      throw new NotFoundException("La demande n'existe pas.");
    }

    return demande;
  }

  // Supprimer une demande
  async remove(id: string) {
    const demande = await this.prisma.demande.findUnique({ where: { id } });

    if (!demande) throw new NotFoundException("La demande n'existe pas.");
    if (demande.statut !== 'SOUMISE') {
      throw new BadRequestException("Impossible de supprimer une demande déjà traitée.");
    }

    await this.prisma.demande.delete({ where: { id } });
    return { message: "✅ Demande supprimée avec succès." };
  }
}
