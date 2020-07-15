import { Module, forwardRef } from '@nestjs/common';
import { HelloCommand } from './hello.command';
import { BaseCommand } from './base.command';
import { CommandsService } from './commands.service';
import { PingCommand } from './ping.command';
import { TimeCommand } from './time.command';
import { TasksCommand } from './tasks.command';
import { TrelloService } from '../trello/trello.service';
import { TrelloModule } from '../trello/trello.module';

@Module({
  providers: [
    HelloCommand,
    BaseCommand,
    CommandsService,
    PingCommand,
    TimeCommand,
    TasksCommand,
  ],
  imports: [TrelloModule],
  exports: [CommandsService],
})
export class CommandsModule {}
