import { Module, HttpModule } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { TwitterController } from './twitter.controller';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { PushModule } from '../push/push.module';
import { TwitterStreamService } from './twitter-stream.service';

@Module({
  providers: [TwitterService, TwitterStreamService],
  imports: [ConfigModule, HttpModule, LoggerModule, PushModule],
  controllers: [TwitterController],
  exports: [TwitterService],
})
export class TwitterModule {}
