import { Test, TestingModule } from '@nestjs/testing';
import { AibouController } from './aibou.controller';

describe('AibouController', () => {
  let controller: AibouController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AibouController],
    }).compile();

    controller = module.get<AibouController>(AibouController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
