import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateursService } from './utilisateur.service';

describe('UtilisateurService', () => {
  let service: UtilisateursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilisateursService],
    }).compile();

    service = module.get<UtilisateursService>(UtilisateursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
