import { Module } from '@nestjs/common';
import { TacheService } from './tache.service';
import { TacheController } from './tache.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TacheController],
  providers: [TacheService, PrismaService],
})
export class TacheModule {}
