import { Test, TestingModule } from '@nestjs/testing';
import { RecurringService } from '../recurring.service';

describe('RecurringService', () => {
  let service: RecurringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringService],
    }).compile();

    service = module.get<RecurringService>(RecurringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
