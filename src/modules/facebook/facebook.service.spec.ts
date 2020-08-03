import { Test, TestingModule } from '@nestjs/testing';
import { FacebookService } from './facebook.service';

describe('FacebookService', () => {
  let service: FacebookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacebookService],
    }).compile();

    service = module.get<FacebookService>(FacebookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
