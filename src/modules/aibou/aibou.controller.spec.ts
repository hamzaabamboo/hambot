import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AibouController } from './aibou.controller';
import { AibouService } from './aibou.service';

describe('AibouController', () => {
  let controller: AibouController;
  let config: ConfigService;
  class MockRes {
    status() {
      return this
    }
    send() {
      return this
    }
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [{ provide: AibouService, useValue: { fetchNewData: jest.fn().mockResolvedValue('mock'), saveNewData: jest.fn() } }],
      controllers: [AibouController],
    }).compile();

    controller = module.get<AibouController>(AibouController);
    config = module.get(ConfigService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('authentication', () => {
    it('should reject', async () => {
      const res = new MockRes()
      const statusSpy = jest.spyOn(res, 'status')
      await controller.syncData(
        {},
        { headers: { ['x-aibou-secret']: 'asdf' } } as any,
        res as any,
      )
      expect(statusSpy).toBeCalledWith(401)
    });
    it('should accept', async () => {
      const res = new MockRes()
      const statusSpy = jest.spyOn(res, 'status')
      const dataSpy = jest.spyOn(res, 'send')
      const result = await controller.syncData(
        {},
        { headers: { ['x-aibou-secret']: config.get('AIBOU_SECRET') } } as any,
        res as any,
      )
      expect(result).toBeUndefined()
      expect(statusSpy).toBeCalledWith(200)
      expect(dataSpy).toBeCalledWith('mock')
    });
  });
});
