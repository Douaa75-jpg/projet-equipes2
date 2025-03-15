import { Module } from '@nestjs/common';
import { ResponsableController } from './responsable.controller';
import { ResponsableService } from './responsable.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeResponsable } from '@prisma/client';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';

@Module({
  controllers: [ResponsableController],
  providers: [ResponsableService, PrismaService],
  exports: [ResponsableService],
})
export class ResponsableModule {}
