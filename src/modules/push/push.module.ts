import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { DiscordModule } from '../discord/discord.module';
import { MessagesModule } from '../messages/messages.module';
import { TrelloModule } from '../trello/trello.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [PushService],
  imports: [MessagesModule, TrelloModule, DiscordModule, LoggerModule],
  exports: [PushService],
})
export class PushModule {}
