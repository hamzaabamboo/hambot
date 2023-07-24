import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from '../discord/discord.module';
import { LoggerModule } from '../logger/logger.module';
import { MessagesModule } from '../messages/messages.module';
import { TrelloModule } from '../trello/trello.module';
import { PushService } from './push.service';

@Module({
  providers: [PushService],
  imports: [
    forwardRef(() => MessagesModule),
    TrelloModule,
    forwardRef(() => DiscordModule),
    LoggerModule,
    ConfigModule,
  ],
  exports: [PushService],
})
export class PushModule {}
