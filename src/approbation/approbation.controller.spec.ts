import { Test, TestingModule } from '@nestjs/testing';
import { ApprobationController } from './approbation.controller';
import { ApprobationService } from './approbation.service';

describe('ApprobationController', () => {
  let controller: ApprobationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprobationController],
      providers: [ApprobationService],
    }).compile();

    controller = module.get<ApprobationController>(ApprobationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
