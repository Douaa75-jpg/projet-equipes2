// src/record/record.module.ts
import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { PrismaService } from '../prisma/prisma.service'; // ✅ chemin correct


@Module({
  controllers: [RecordController],
  providers: [RecordService, PrismaService],
})
export class RecordModule {}
