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
import { PromptPayCommand } from './promptpay.command';
import { BaseDiscordCommand } from './discord/base.discord.command';
import { ShakeCommand } from './discord/shake.command';
import { YoutubeCommand } from './discord/youtube.command';
import { StreamCommand } from './discord/stream.command';
import { ActivateCommand } from './activate.command';
import { PushCommand } from './push.command';

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
    promptPay: PromptPayCommand,
    shake: ShakeCommand,
    discord: BaseDiscordCommand,
    activate: ActivateCommand,
    youtube: YoutubeCommand,
    stream: StreamCommand,
    push: PushCommand,
    authCmd: AuthCommand,
  ) {
    this.commands = [
      hello,
      promptPay,
      task,
      time,
      ping,
      shake,
      authCmd,
      activate,
      youtube,
      stream,
      push,
      discord,
      base,
    ];
  }

  isCommand(message: Message) {
    return (
      (this.commands
        .filter(
          e => e.channels === undefined || e.channels.includes(message.channel),
        )
        .find(c => c.matchInput(message.message)) &&
        message.message !== '') ||
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
    const handler = this.commands
      .filter(
        e => e.channels === undefined || e.channels.includes(message.channel),
      )
      .find(function(command) {
        return command.matchInput(message.message);
      });
    if (handler.requiresAuth) {
      if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
        return handler.handleInput(message);
      } else {
        return {
          ...message,
          files: [],
          message: 'You cannot use this command',
        };
      }
    }
    return handler.handleInput(message);
  }
}
