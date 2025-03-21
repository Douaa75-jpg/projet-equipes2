import { Test, TestingModule } from '@nestjs/testing';
import { TacheService } from './tache.service';

describe('TacheService', () => {
  let service: TacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TacheService],
    }).compile();

    service = module.get<TacheService>(TacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
