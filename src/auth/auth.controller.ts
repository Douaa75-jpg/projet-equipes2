import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';  // Ajout de l'importation
import { CreateUtilisateurDto } from 'src/utilisateur/dto/create-utilisateur.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  async login(@Body() createAuthDto: CreateUtilisateurDto) {
    return this.authService.login(createAuthDto.email, createAuthDto.motDePasse);
  }
}
