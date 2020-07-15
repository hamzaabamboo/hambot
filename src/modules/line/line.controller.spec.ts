import { Test, TestingModule } from '@nestjs/testing';
import { LineController } from './line.controller';

describe('Line Controller', () => {
  let controller: LineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineController],
    }).compile();

    controller = module.get<LineController>(LineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
