import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../logger/logger.module';
import { PushModule } from '../../push/push.module';
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
