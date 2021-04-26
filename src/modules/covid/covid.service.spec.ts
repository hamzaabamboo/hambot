import { Test, TestingModule } from '@nestjs/testing';
import { CovidService } from './covid.service';

describe('CovidService', () => {
  let service: CovidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CovidService],
    }).compile();

    service = module.get<CovidService>(CovidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
