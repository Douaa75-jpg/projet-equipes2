import { Test, TestingModule } from '@nestjs/testing';
import { ApprobationService } from './approbation.service';

describe('ApprobationService', () => {
  let service: ApprobationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprobationService],
    }).compile();

    service = module.get<ApprobationService>(ApprobationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
