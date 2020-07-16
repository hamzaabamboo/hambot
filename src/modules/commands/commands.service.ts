import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './command.base';
import { HelloCommand } from './hello.command';
import { PingCommand } from './ping.command';
import { TimeCommand } from './time.command';
import { TasksCommand } from './tasks.command';
import { CompoundService } from './compound.service';

@Injectable()
export class CommandsService {
  private commands: BaseCommand[];

  constructor(
    private compound: CompoundService,
    hello: HelloCommand,
    base: BaseCommand,
    time: TimeCommand,
    task: TasksCommand,
    ping: PingCommand,
  ) {
    this.commands = [hello, task, time, ping, base];
  }

  isCommand(message: Message) {
    return (
      this.commands.find(c => c.matchInput(message.message)) ||
      this.compound.isCompounding(message.senderId)
    );
  }

  handleCommand(message: Message) {
    if (this.compound.isCompounding(message.senderId)) {
      return this.compound.handleCompound(message);
    }
    if (this.compound.canCompound(message)) {
      const res = this.compound.startCompound(message);
      return res;
    }
    return this.commands
      .find(function(command) {
        return command.matchInput(message.message);
      })
      .handleInput(message);
  }
}
