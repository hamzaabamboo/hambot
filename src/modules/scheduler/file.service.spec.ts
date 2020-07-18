import { Test, TestingModule } from '@nestjs/testing';
import { FileSchedule } from './file.schedule';

describe('FileService', () => {
  let service: FileSchedule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileSchedule],
    }).compile();

    service = module.get<FileSchedule>(FileSchedule);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
