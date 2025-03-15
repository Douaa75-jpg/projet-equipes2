import { Module } from '@nestjs/common';
import { CongeService } from './conge.service';
import { CongeController } from './conge.controller';

@Module({
  controllers: [CongeController],
  providers: [CongeService],
})
export class CongeModule {}
