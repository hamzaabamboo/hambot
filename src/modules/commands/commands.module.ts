import { Module, forwardRef } from '@nestjs/common';
import { HelloCommand } from './hello.command';
import { BaseCommand } from './command.base';
import { CommandsService } from './commands.service';
import { PingCommand } from './ping.command';
import { TimeCommand } from './time.command';
import { TasksCommand } from './tasks.command';
import { TrelloService } from '../trello/trello.service';
import { TrelloModule } from '../trello/trello.module';
import { CompoundService } from './compound.service';

@Module({
  providers: [
    HelloCommand,
    BaseCommand,
    CompoundService,
    CommandsService,
    PingCommand,
    TimeCommand,
    TasksCommand,
  ],
  imports: [TrelloModule],
  exports: [CommandsService],
})
export class CommandsModule {}
