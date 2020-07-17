import { Test, TestingModule } from '@nestjs/testing';
import { PromptpayCommand } from './promptpay.command';

describe('PromptpayService', () => {
  let service: PromptpayCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptpayCommand],
    }).compile();

    service = module.get<PromptpayCommand>(PromptpayCommand);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
