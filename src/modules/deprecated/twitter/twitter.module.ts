import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../../src/modules/logger/logger.module';
import { PushModule } from '../../../src/modules/push/push.module';
import { TwitterStreamService } from './twitter-stream.service';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
@Module({
  providers: [TwitterService, TwitterStreamService],
  imports: [ConfigModule, HttpModule, LoggerModule, PushModule],
  controllers: [TwitterController],
  exports: [TwitterService],
})
export class TwitterModule {}
