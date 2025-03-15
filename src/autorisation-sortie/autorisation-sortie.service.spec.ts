import { Test, TestingModule } from '@nestjs/testing';
import { AutorisationSortieService } from './autorisation-sortie.service';

describe('AutorisationSortieService', () => {
  let service: AutorisationSortieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutorisationSortieService],
    }).compile();

    service = module.get<AutorisationSortieService>(AutorisationSortieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
