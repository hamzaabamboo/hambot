import { Test, TestingModule } from '@nestjs/testing';
import { IcalService } from './ical.service';

describe('IcalService', () => {
  let service: IcalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IcalService],
    }).compile();

    service = module.get<IcalService>(IcalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
