import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './command.base';
import { HelloCommand } from './hello.command';
import { PingCommand } from './ping.command';
import { TimeCommand } from './time.command';
import { TasksCommand } from './tasks.command';
import { CompoundService } from './compound.service';
import { AuthService } from '../auth/auth.service';
import { AuthCommand } from './auth.command';

@Injectable()
export class CommandsService {
  private commands: BaseCommand[];

  constructor(
    private compound: CompoundService,
    private auth: AuthService,
    hello: HelloCommand,
    base: BaseCommand,
    time: TimeCommand,
    task: TasksCommand,
    ping: PingCommand,
    authCmd: AuthCommand,
  ) {
    this.commands = [hello, task, time, ping, authCmd, base];
  }

  isCommand(message: Message) {
    return (
      this.commands.find(c => c.matchInput(message.message)) ||
      this.compound.isCompounding(message.senderId)
    );
  }

  async handleCommand(message: Message) {
    if (this.compound.isCompounding(message.senderId)) {
      return this.compound.handleCompound(message);
    }
    if (this.compound.canCompound(message)) {
      const res = this.compound.startCompound(message);
      return res;
    }
    const handler = this.commands.find(function(command) {
      return command.matchInput(message.message);
    });
    if (handler.requiresAuth) {
      if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
        return handler.handleInput(message);
      } else {
        return {
          ...message,
          message: 'You cannot use this command',
        };
      }
    }
    return handler.handleInput(message);
  }
}
