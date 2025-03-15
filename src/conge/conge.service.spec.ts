import { Test, TestingModule } from '@nestjs/testing';
import { CongeService } from './conge.service';

describe('CongeService', () => {
  let service: CongeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CongeService],
    }).compile();

    service = module.get<CongeService>(CongeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
