import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extraire le token depuis l'en-tête "Authorization"
      ignoreExpiration: false,
      secretOrKey: 'zetabox123',  // Utilisez la même clé que dans auth.module.ts
    });
  }

  async validate(payload: any) {
    return { email: payload.email, role: payload.role };  // Définir ce qui sera ajouté à la requête après validation
  }
}
