import { Test, TestingModule } from '@nestjs/testing';
import { WanikaniService } from './wanikani.service';

describe('WanikaniService', () => {
  let service: WanikaniService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WanikaniService],
    }).compile();

    service = module.get<WanikaniService>(WanikaniService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
