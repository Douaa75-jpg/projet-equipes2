import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UtilisateursService } from 'src/utilisateur/utilisateur.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), //  تحميل المتغيرات من `.env`
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], //تأكد من تحميل `ConfigModule`
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET est manquant dans le fichier .env');
        }
        return {
          secret: jwtSecret, 
          signOptions: { expiresIn: '1h' },
        };
      }
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UtilisateursService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
