import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { PushModule } from '../push/push.module';
import { WanikaniClientService } from './wanikani-client.service';
import { WanikaniService } from './wanikani.service';

@Module({
  imports: [ConfigModule, LoggerModule, PushModule],
  providers: [WanikaniService, WanikaniClientService],
  exports: [WanikaniService],
})
export class WanikaniModule {}
