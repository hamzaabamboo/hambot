import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CommandsModule } from '../commands/commands.module';
import { LineModule } from '../line/line.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  providers: [MessagesService],
  imports: [
    CommandsModule,
    forwardRef(() => LineModule),
    forwardRef(() => DiscordModule),
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
