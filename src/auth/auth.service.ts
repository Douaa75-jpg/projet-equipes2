import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UtilisateursService } from 'src/utilisateur/utilisateur.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UtilisateursService,  // Le service utilisateur
    private jwtService: JwtService,    // Le service JWT pour signer et vérifier les tokens
  ) {}

  // Méthode pour valider l'utilisateur et générer un token
  async validateUser(email: string, motDePasse: string): Promise<any> {
    const utilisateur = await this.userService.findByEmail(email);  // Correction ici

    if (!utilisateur) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Comparer le mot de passe envoyé avec celui enregistré
    const isPasswordValid = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const { motDePasse: _, ...result } = utilisateur; // Exclure le mot de passe
    return result;
  }

  // Méthode pour générer un JWT après validation de l'utilisateur
  async login(email: string, motDePasse: string) {
    const utilisateur = await this.validateUser(email, motDePasse);

    // Créer un payload avec l'email et le rôle de l'utilisateur
    const payload = { email: utilisateur.email, role: utilisateur.role };

    return {
      access_token: this.jwtService.sign(payload),  // Génération du JWT
    };
  }
}
