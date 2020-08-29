import { Test, TestingModule } from '@nestjs/testing';
import { ClipperService } from './clipper.service';

describe('ClipperService', () => {
  let service: ClipperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClipperService],
    }).compile();

    service = module.get<ClipperService>(ClipperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
