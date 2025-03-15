import { Test, TestingModule } from '@nestjs/testing';
import { AutorisationSortieController } from './autorisation-sortie.controller';
import { AutorisationSortieService } from './autorisation-sortie.service';

describe('AutorisationSortieController', () => {
  let controller: AutorisationSortieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutorisationSortieController],
      providers: [AutorisationSortieService],
    }).compile();

    controller = module.get<AutorisationSortieController>(AutorisationSortieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
