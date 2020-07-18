import { Test, TestingModule } from '@nestjs/testing';
import { PromptPayCommand } from './promptpay.command';

describe('PromptpayService', () => {
  let service: PromptPayCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptPayCommand],
    }).compile();

    service = module.get<PromptPayCommand>(PromptPayCommand);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
