import { Injectable, UnauthorizedException , Logger} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
    id: string;
    email: string;
    role: string;
    nom: string;
    prenom: string;
    matricule: string;
    datedenaissance: string;
  }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService,
    configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

 
  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating token with payload: ${JSON.stringify(payload)}`);

    if (!payload) {
      this.logger.error('Token validation failed: No payload found');
      throw new UnauthorizedException('Token invalide: Pas de payload trouvé');
    }

    if (!payload.id || !payload.email || !payload.role || !payload.nom) {
      this.logger.error('Token validation failed: Missing required fields in payload');
      throw new UnauthorizedException('Token invalide: Champs manquants dans le payload');
    }

    const responsable = await this.prisma.responsable.findUnique({
      where: { id: payload.id }, // Assuming the payload id corresponds to the responsable id
    });

    if (!responsable) {
      this.logger.error('Token validation failed: Responsable not found');
      throw new UnauthorizedException('Responsable non trouvé dans la base de données');
    }

    this.logger.debug('Token validated successfully');
    return { 
      userId: payload.id,
      email: payload.email, 
      role: payload.role ,
      nom: payload.nom ,
      prenom: payload.prenom,
      matricule: payload.matricule,
      datedenaissance: payload.datedenaissance, 
      typeResponsable: responsable.typeResponsable,};
  }
}