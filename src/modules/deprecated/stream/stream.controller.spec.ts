import { Test, TestingModule } from '@nestjs/testing';
import { StreamService } from './stream.service';

describe('Stream Controller', () => {
  let controller: StreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamService],
    }).compile();

    controller = module.get<StreamService>(StreamService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
