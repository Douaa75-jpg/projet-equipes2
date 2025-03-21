import { Test, TestingModule } from '@nestjs/testing';
import { TacheController } from './tache.controller';
import { TacheService } from './tache.service';

describe('TacheController', () => {
  let controller: TacheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TacheController],
      providers: [TacheService],
    }).compile();

    controller = module.get<TacheController>(TacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
