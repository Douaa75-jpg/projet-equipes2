import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UtilisateursService } from 'src/utilisateur/utilisateur.service';
import { ResponsableService } from 'src/responsable/responsable.service';

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
    };
  }

  // Login de l'utilisateur
  async login(user: UtilisateurAvecResponsable) {
    this.logger.debug(`Connexion de l'utilisateur : ${user.email}`);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
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
        typeResponsable: user.responsable?.typeResponsable || null, // Renvoi null si typeResponsable est absent
      },
    };
  }

  // Déconnexion de l'utilisateur
  async logout() {
    this.logger.debug('Déconnexion de l\'utilisateur');
    return { message: 'Déconnexion réussie. Le token a été supprimé côté client.' };
  }
}
