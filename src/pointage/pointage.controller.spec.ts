import { Test, TestingModule } from '@nestjs/testing';
import { PointageController } from './pointage.controller';
import { PointageService } from './pointage.service';

describe('PointageController', () => {
  let controller: PointageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointageController],
      providers: [PointageService],
    }).compile();

    controller = module.get<PointageController>(PointageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
