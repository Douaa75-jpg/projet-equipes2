import { Controller, Post, Body, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
    this.logger.log(`Tentative de connexion pour : ${loginDto.email}`); // Log l'email de la tentative de connexion

    // Vérifier si les paramètres sont manquants
    if (!loginDto.email || !loginDto.motDePasse) {
      this.logger.error('Paramètres manquants : Email et mot de passe sont requis');
      throw new BadRequestException('Email et mot de passe sont requis');
    }

    // Valider l'utilisateur
    this.logger.debug(`Validation de l'utilisateur : ${loginDto.email}`);
    const user = await this.authService.validateUser(loginDto.email, loginDto.motDePasse);
    
    // Si l'utilisateur n'est pas trouvé ou le mot de passe est incorrect
    if (!user) {
      this.logger.error(`Échec de la connexion pour : ${loginDto.email} - Email ou mot de passe incorrect`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Si la connexion réussit
    this.logger.log(`Connexion réussie pour : ${loginDto.email}`);
    return this.authService.login(user);
  }
}