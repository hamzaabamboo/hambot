import { Test, TestingModule } from '@nestjs/testing';
import { ClipperController } from './clipper.controller';

describe('Clipper Controller', () => {
  let controller: ClipperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClipperController],
    }).compile();

    controller = module.get<ClipperController>(ClipperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
