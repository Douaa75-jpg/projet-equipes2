import { Controller, Post, Body, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth') // Ajoute la catégorie "Auth" dans Swagger
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger pour le contrôleur

  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
    @ApiBody({
      description: 'Informations de connexion',
      type: CreateAuthDto,
    }) // ✅ Permet d'afficher le champ Body dans Swagger
    async login(@Body() loginDto: CreateAuthDto) {
      this.logger.log(`Tentative de connexion pour : ${loginDto.email}`);
    
      if (!loginDto.email || !loginDto.motDePasse ) {
        this.logger.error('Paramètres manquants : Email, mot de passe et rôle sont requis');
        throw new BadRequestException('Email, mot de passe et rôle sont requis');
      }
  
    const user = await this.authService.validateUser (loginDto.email, loginDto.motDePasse);
    
    if (!user) {
      this.logger.error(`Échec de la connexion pour : ${loginDto.email} - Email ou mot de passe incorrect`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  
    this.logger.log(`Connexion réussie pour : ${loginDto.email}`);
    return this.authService.login(user as any); // L'utilisateur est déjà validé et prêt à être connecté
  }
  
  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout() {
    this.logger.log('Déconnexion de l\'utilisateur');
    // Le logout sera géré côté client (suppression du token JWT)
    return { message: 'Déconnexion réussie. Le token a été supprimé côté client.' };
  }

  @Post('forgot-password')
async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  if (!forgotPasswordDto.email) {
    throw new BadRequestException('L\'email est requis');
  }
  const result = await this.authService.createResetToken(forgotPasswordDto.email);
  return { 
    success: true,
    message: result.message 
  };
}

  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialisation du mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    if (!resetPasswordDto.token || !resetPasswordDto.newPassword) {
      throw new BadRequestException('Token et nouveau mot de passe sont requis');
    }
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}