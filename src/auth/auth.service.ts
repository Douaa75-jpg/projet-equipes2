import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UtilisateursService } from 'src/utilisateur/utilisateur.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // Logger pour le service

  constructor(
    private utilisateursService: UtilisateursService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, motDePasse: string) {
    this.logger.debug(`Validation de l'utilisateur avec l'email : ${email}`);
  
    const user = await this.utilisateursService.findByEmail(email);
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
    const { motDePasse: hashedPassword, ...result } = user; // تغيير اسم المتغير
    return result; // Supprime le mot de passe de la réponse
  }

  async login(user: any) {
    this.logger.debug(`Connexion de l'utilisateur : ${user.email}`);

    const payload = { id: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    this.logger.debug(`Token généré pour l'utilisateur : ${user.email}`);
    this.logger.debug(`Token : ${access_token}`);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
    
  }
}