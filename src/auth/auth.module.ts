import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'zetabox123', // ⚠️ Utilise plutôt process.env.JWT_SECRET dans un fichier .env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
