import { Test, TestingModule } from '@nestjs/testing';
import { OutlineService } from './outline.service';

describe('OutlineService', () => {
  let service: OutlineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutlineService],
    }).compile();

    service = module.get<OutlineService>(OutlineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
