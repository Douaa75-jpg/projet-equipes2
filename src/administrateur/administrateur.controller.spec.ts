import { Test, TestingModule } from '@nestjs/testing';
import { AdministrateurController } from './administrateur.controller';
import { AdministrateurService } from './administrateur.service';

describe('AdministrateurController', () => {
  let controller: AdministrateurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministrateurController],
      providers: [AdministrateurService],
    }).compile();

    controller = module.get<AdministrateurController>(AdministrateurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
