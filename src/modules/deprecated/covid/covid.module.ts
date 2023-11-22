import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../../src/modules/logger/logger.module';
import { PushModule } from '../../../src/modules/push/push.module';
import { CovidController } from './covid.controller';
import { CovidService } from './covid.service';

@Module({
  imports: [HttpModule, LoggerModule, PushModule, ConfigModule],
  providers: [CovidService],
  exports: [CovidService],
  controllers: [CovidController],
})
export class CovidModule {}
