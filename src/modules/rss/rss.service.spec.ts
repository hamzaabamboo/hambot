import { Test, TestingModule } from '@nestjs/testing';
import { RssService } from './rss.service';

describe('RssService', () => {
  let service: RssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RssService],
    }).compile();

    service = module.get<RssService>(RssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
