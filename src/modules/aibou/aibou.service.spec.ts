import { Test, TestingModule } from '@nestjs/testing';
import { AibouService } from './aibou.service';

describe('AibouService', () => {
  let service: AibouService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AibouService],
    }).compile();

    service = module.get<AibouService>(AibouService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
