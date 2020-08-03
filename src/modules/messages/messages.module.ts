import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CommandsModule } from '../commands/commands.module';
import { LineModule } from '../line/line.module';
import { DiscordModule } from '../discord/discord.module';
import { LoggerModule } from '../logger/logger.module';
import { FacebookModule } from '../facebook/facebook.module';

@Module({
  providers: [MessagesService],
  imports: [
    LoggerModule,
    CommandsModule,
    forwardRef(() => LineModule),
    forwardRef(() => DiscordModule),
    forwardRef(() => FacebookModule),
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
