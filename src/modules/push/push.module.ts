import { Module, forwardRef } from '@nestjs/common';
import { PushService } from './push.service';
import { DiscordModule } from '../discord/discord.module';
import { MessagesModule } from '../messages/messages.module';
import { TrelloModule } from '../trello/trello.module';
import { LoggerModule } from '../logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [PushService],
  imports: [forwardRef(() => MessagesModule), TrelloModule, DiscordModule, LoggerModule, ConfigModule],
  exports: [PushService],
})
export class PushModule {}
