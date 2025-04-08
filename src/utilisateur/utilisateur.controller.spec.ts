import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateursController } from './utilisateur.controller';
import { UtilisateursService } from './utilisateur.service';

describe('UtilisateurController', () => {
  let controller: UtilisateursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilisateursController],
      providers: [UtilisateursService],
    }).compile();

    controller = module.get<UtilisateursController>(UtilisateursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
