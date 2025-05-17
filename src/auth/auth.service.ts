import { Injectable, UnauthorizedException,BadRequestException,  Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UtilisateursService } from 'src/utilisateur/utilisateur.service';
import { ResponsableService } from 'src/responsable/responsable.service';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';

// Interface Utilisateur avec typeResponsable
interface UtilisateurAvecResponsable {
  id: string;
  nom: string;
  prenom: string;
  email: string;

  motDePasse: string;
  role: string;
  responsable?: {
    typeResponsable?: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private utilisateursService: UtilisateursService,
    private jwtService: JwtService,
    private responsableService: ResponsableService, // Injecter le service responsable
    private mailerService: MailerService,
    private prisma: PrismaService,
  ) {}

  // Validation de l'utilisateur
  async validateUser(email: string, motDePasse: string) {
    this.logger.debug(`Validation de l'utilisateur avec l'email : ${email}`);

    const user: UtilisateurAvecResponsable | null = await this.utilisateursService.findByEmail(email);
    if (!user) {
      this.logger.error(`Utilisateur non trouvé avec l'email : ${email}`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      this.logger.error(`Mot de passe incorrect pour l'utilisateur : ${email}`);
      return null;
    }

    this.logger.debug(`Utilisateur validé avec succès : ${email}`);

    // Si l'utilisateur est un responsable, récupérer le type de responsable à partir de la table 'responsable'
    let userWithResponsable = { ...user };

    if (user.role === 'RESPONSABLE') {
      // Chercher le type de responsable depuis la table responsable
      const responsableDetails = await this.responsableService.findByUtilisateurId(user.id);
      if (responsableDetails && responsableDetails.typeResponsable) {
        userWithResponsable.responsable = {
          typeResponsable: responsableDetails.typeResponsable,
        };
      }
    }

    // Retirer le mot de passe de la réponse
    const { motDePasse: hashedPassword, ...result } = userWithResponsable;

    // Ajouter le typeResponsable à la réponse
    return {
      ...result,
      typeResponsable: userWithResponsable.responsable?.typeResponsable || null, // Défaut à null si typeResponsable est absent
      nom: userWithResponsable.nom, 
    };
  }

  // Login de l'utilisateur
  async login(user: UtilisateurAvecResponsable) {
    this.logger.debug(`Connexion de l'utilisateur : ${user.email}`);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom, 
      matricule: (user as any).matricule, 
      datedenaissance: (user as any).datedenaissance,
      typeResponsable: user.role === 'RESPONSABLE' ? user.responsable?.typeResponsable : null, // Renvoie null si responsable ou typeResponsable est absent
    };

    const access_token = this.jwtService.sign(payload);

    this.logger.debug(`Token généré pour l'utilisateur : ${user.email}`);
    this.logger.debug(`Token : ${access_token}`);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom, 
        matricule: (user as any).matricule,
        datedenaissance: (user as any).datedenaissance,
        typeResponsable: user.responsable?.typeResponsable || null, // Renvoi null si typeResponsable est absent
      },
    };
  }

  // Déconnexion de l'utilisateur
  async logout() {
    this.logger.debug('Déconnexion de l\'utilisateur');
    return { message: 'Déconnexion réussie. Le token a été supprimé côté client.' };
  }




  async createResetToken(email: string): Promise<{ message: string }> {
    const user = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    // Vérifier si un token valide existe déjà
    if (user.resetPasswordToken ) {
      return { message: 'Un lien de réinitialisation a déjà été envoyé à cet email' };
    }

    const token = uuidv4();
    const expires = addHours(new Date(), 1);

    await this.prisma.utilisateur.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        template: 'reset-password',
        context: {
          name: `${user.prenom} ${user.nom}`,
          resetUrl,
          expirationHours: 1,
        },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
      throw new BadRequestException("Erreur lors de l'envoi de l'email de réinitialisation");
    }

    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (newPassword.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
    }

    const user = await this.prisma.utilisateur.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.motDePasse);
    if (isSamePassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        motDePasse: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Envoyer un email de confirmation
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Confirmation de réinitialisation de mot de passe',
        template: 'password-reset-confirmation',
        context: {
          name: `${user.prenom} ${user.nom}`,
        },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de confirmation: ${error.message}`);
    }

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}