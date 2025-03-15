import { Module } from '@nestjs/common';
import { PointageService } from './pointage.service';
import { PointageController } from './pointage.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PointageController],
  providers: [PointageService, PrismaService],
})
export class PointageModule {}
