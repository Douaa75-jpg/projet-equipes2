import { Module } from '@nestjs/common';
import { AutorisationSortieService } from './autorisation-sortie.service';
import { AutorisationSortieController } from './autorisation-sortie.controller';

@Module({
  controllers: [AutorisationSortieController],
  providers: [AutorisationSortieService],
})
export class AutorisationSortieModule {}
