import { Module, HttpModule } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { TwitterController } from './twitter.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [TwitterService],
  imports: [ConfigModule, HttpModule],
  controllers: [TwitterController],
})
export class TwitterModule {}
