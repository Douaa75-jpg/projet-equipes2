import { Test, TestingModule } from '@nestjs/testing';
import { ResponsableController } from './responsable.controller';
import { ResponsableService } from './responsable.service';

describe('ResponsableController', () => {
  let controller: ResponsableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsableController],
      providers: [ResponsableService],
    }).compile();

    controller = module.get<ResponsableController>(ResponsableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
