import { Module, forwardRef } from '@nestjs/common';
import { FacebookController } from './facebook.controller';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { MessagesModule } from '../messages/messages.module';
import { FacebookService } from './facebook.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    LoggerModule,
    forwardRef(() => MessagesModule),
  ],
  controllers: [FacebookController],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class FacebookModule {}
