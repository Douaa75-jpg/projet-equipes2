// approbation.module.ts
import { Module } from '@nestjs/common';
import { ApprobationService } from './approbation.service';
import { ApprobationController } from './approbation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApprobationController],
  providers: [ApprobationService],
  exports: [ApprobationService], // If you need to use this service in other modules
})
export class ApprobationModule {}