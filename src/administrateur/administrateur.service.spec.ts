import { Test, TestingModule } from '@nestjs/testing';
import { AdministrateurService } from './administrateur.service';

describe('AdministrateurService', () => {
  let service: AdministrateurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministrateurService],
    }).compile();

    service = module.get<AdministrateurService>(AdministrateurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
