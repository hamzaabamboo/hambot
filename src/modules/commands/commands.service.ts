import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './base.command';
import { HelloCommand } from './hello.command';
import { PingCommand } from './ping.command';
import { TimeCommand } from './time.command';
import { TasksCommand } from './tasks.command';

@Injectable()
export class CommandsService {
  private commands: BaseCommand[];

  constructor(
    hello: HelloCommand,
    base: BaseCommand,
    time: TimeCommand,
    task: TasksCommand,
    ping: PingCommand,
  ) {
    this.commands = [hello, task, time, ping, base];
  }
  isCommand(message: Message) {
    return this.commands.find(c => c.matchInput(message.message));
  }

  handleCommand(message: Message) {
    return this.commands
      .find(function(command) {
        return command.matchInput(message.message);
      })
      .handleInput(message);
  }
}
