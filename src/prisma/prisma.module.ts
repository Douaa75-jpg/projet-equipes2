import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // On exporte PrismaService pour qu'il puisse être utilisé dans d'autres modules
})
export class PrismaModule {}
