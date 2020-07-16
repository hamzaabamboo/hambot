import { Test, TestingModule } from '@nestjs/testing';
import { CompoundService } from './compound.service';

describe('CompoundService', () => {
  let service: CompoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompoundService],
    }).compile();

    service = module.get<CompoundService>(CompoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
