import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '../logger/logger.module';
import { PushModule } from '../push/push.module';
import { CovidService } from './covid.service';
import { CovidController } from './covid.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, LoggerModule, PushModule, ConfigModule],
  providers: [CovidService],
  exports: [CovidService],
  controllers: [CovidController],
})
export class CovidModule {}
