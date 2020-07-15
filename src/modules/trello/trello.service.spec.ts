import { Test, TestingModule } from '@nestjs/testing';
import { TrelloService } from './trello.service';

describe('TrelloService', () => {
  let service: TrelloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrelloService],
    }).compile();

    service = module.get<TrelloService>(TrelloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
