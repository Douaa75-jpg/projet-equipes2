import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandeApprobationDto } from './dto/create-approbation.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ApprobationService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService
  ) {}

  async creerDemande(createDemandeApprobationDto: CreateDemandeApprobationDto) {
    const { email, nom, prenom, role, typeResponsable, responsableId } = createDemandeApprobationDto;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await this.prisma.utilisateur.findUnique({
      where: { email },
    });

    if (utilisateurExistant) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Trouver un RH pour l'approbation
    const rh = await this.trouverRH();

    // Créer l'utilisateur avec le statut EN_ATTENTE
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        role,
        status: 'EN_ATTENTE',
        motDePasse: '', // Mot de passe vide en attendant l'approbation
      },
    });

    // Créer l'approbation RH
    await this.prisma.approbationRH.create({
      data: {
        utilisateurId: utilisateur.id,
        responsableId: rh.id,
        statut: 'EN_ATTENTE',
      },
    });

    return utilisateur;
  }

  async trouverRH() {
    const rh = await this.prisma.utilisateur.findFirst({
      where: {
        role: 'RESPONSABLE',
        responsable: {
          typeResponsable: 'RH',
        },
      },
    });

    if (!rh) {
      throw new NotFoundException('Aucun responsable RH trouvé');
    }

    return rh;
  }

  async approuverUtilisateur(utilisateurId: string, responsableId: string, commentaire?: string) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Vérifier que le responsable est bien un RH
      const responsable = await prisma.responsable.findUnique({
        where: { id: responsableId },
        include: { utilisateur: true }
      });

      if (!responsable || responsable.utilisateur.role !== 'RESPONSABLE' 
        || responsable.typeResponsable !== 'RH') {
        throw new ForbiddenException('Seul un RH peut approuver les demandes');
      }

      // 2. Rechercher la demande d'approbation
      const approbation = await prisma.approbationRH.findFirst({
        where: { utilisateurId, responsableId },
        include: { utilisateur: true }
      });

      if (!approbation) {
        throw new NotFoundException('Demande d\'approbation non trouvée');
      }

      // 3. Générer un token d'activation
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24); // Validité 24 heures

      // 4. Mettre à jour la demande d'approbation
      const updatedApprobation = await prisma.approbationRH.update({
        where: { id: approbation.id },
        data: {
          statut: 'APPROUVEE',
          dateApprobation: new Date(),
          commentaire,
        },
      });

      // 5. Mettre à jour l'utilisateur
      const utilisateur = await prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: {
          status: 'APPROUVE',
          isActive: false,
          registrationToken: token,
          tokenExpiresAt: expiryDate,
        },
      });

      // 6. Envoyer l'email d'activation
      await this.envoyerEmailActivation(utilisateur.email, token);

      return updatedApprobation;
    });
  }

  private async envoyerEmailActivation(email: string, token: string) {
    const activationLink = `http://votre-site.com/auth/finaliser-inscription?token=${token}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Activation de votre compte',
        template: 'activation',
        context: {
          link: activationLink
        }
      });
      console.log(`Email d'activation envoyé à ${email}`);
    } catch (error) {
      console.error(`Échec d'envoi d'email à ${email}`, error);
      throw new Error('Échec d\'envoi de l\'email d\'activation');
    }
  }

  async rejeterUtilisateur(utilisateurId: string, responsableId: string, commentaire: string) {
    return this.prisma.$transaction(async (prisma) => {
      // First find the approval to get its ID
      const approbation = await prisma.approbationRH.findFirst({
        where: { utilisateurId },
      });

      if (!approbation) {
        throw new NotFoundException('Approval not found');
      }

      // Mettre à jour l'approbation using its ID
      const updatedApprobation = await prisma.approbationRH.update({
        where: { id: approbation.id },
        data: {
          statut: 'REJETEE',
          dateApprobation: new Date(),
          commentaire,
        },
      });

      // Désactiver l'utilisateur
      await prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: {
          status: 'REJETE',
          isActive: false,
        },
      });

      return updatedApprobation;
    });
  }

  async getDemandesEnAttente() {
    return this.prisma.approbationRH.findMany({
      where: { statut: 'EN_ATTENTE' },
      include: {
        utilisateur: true,
        responsable: true,
      },
    });
  }

  async getHistoriqueApprobations() {
    return this.prisma.approbationRH.findMany({
      where: {
        statut: { in: ['APPROUVEE', 'REJETEE'] },
      },
      include: {
        utilisateur: true,
        responsable: true,
      },
      orderBy: {
        dateApprobation: 'desc',
      },
    });
  }
}