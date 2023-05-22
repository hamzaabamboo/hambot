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
// import { StreamCommand } from './deprecated/stream.command';
import { ActivateCommand } from './activate.command';
import { PushCommand } from './push.command';
import { RandomCommand } from './random.command';
import { ClipboardCommand } from './clipboard.command';
import { NyaaCommand } from './nyaa.command';
import { RecurringCommand } from './recurring.command';
import { ProfilePicCommand } from './discord/profilepic.command';
import { TwitterCommand } from './twitter.command';
import { CovidCommand } from './covid.command';
import { FriendCommand } from './friend.command';

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
    // stream: StreamCommand,
    push: PushCommand,
    authCmd: AuthCommand,
    random: RandomCommand,
    clipboard: ClipboardCommand,
    nyaa: NyaaCommand,
    recurring: RecurringCommand,
    twitter: TwitterCommand,
    covid: CovidCommand,
    friend: FriendCommand,
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
      random,
      // stream,
      push,
      discord,
      clipboard,
      nyaa,
      recurring,
      twitter,
      covid,
      friend,
      //Always bottom
      base,
    ];
  }

  isCommand(message: Message) {
    return (
      (this.commands
        .filter((e) =>
          e.channels === undefined
            ? true
            : e.channels.includes(message.channel),
        )
        .find((c) => c.matchInput(message.message)) &&
        message.message !== '') ||
      this.compound.isCompounding(message.senderId)
    );
  }

  async handleCommand(message: Message): Promise<Message> {
    if (this.compound.isCompounding(message.senderId)) {
      return this.compound.handleCompound(message);
    }
    if (this.compound.canCompound(message)) {
      const res = await this.compound.startCompound(message);
      return { ...message, ...(res as Partial<Message>) };
    }
    const handler = this.commands
      .filter(
        (e) => e.channels === undefined || e.channels.includes(message.channel),
      )
      .find(function (command) {
        return command.matchInput(message.message);
      });
    if (handler.requiresAuth) {
      if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
        return {
          ...message,
          ...(await handler.handleInput(message)),
        };
      } else {
        return {
          ...message,
          files: [],
          message: 'You cannot use this command',
        };
      }
    }
    try {
      return {
        ...message,
        ...(await handler.handleInput(message)),
      };
    } catch (error) {
      if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
        return {
          ...message,
          files: [],
          message: `Something went wrong : ${error?.message || error}`,
        };
      } else {
        return {
          ...message,
          files: [],
          message: `Something went wrong`,
        };
      }
    }
  }
}
