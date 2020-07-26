import { Module } from '@nestjs/common';
import { HelloCommand } from './hello.command';
import { BaseCommand } from './command.base';
import { CommandsService } from './commands.service';
import { PingCommand } from './ping.command';
import { TimeCommand } from './time.command';
import { TasksCommand } from './tasks.command';
import { TrelloModule } from '../trello/trello.module';
import { CompoundService } from './compound.service';
import { AuthModule } from '../auth/auth.module';
import { AuthCommand } from './auth.command';
import { PromptPayCommand } from './promptpay.command';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { BaseDiscordCommand } from './discord/base.discord.command';
import { ShakeCommand } from './discord/shake.command';
import { DiscordModule } from '../discord/discord.module';
import { YoutubeCommand } from './discord/youtube.command';
import { AudioModule } from '../audio/audio.module';
import { StreamCommand } from './discord/stream.command';
import { ActivateCommand } from './activate.command';
import { PushCommand } from './push.command';

@Module({
  providers: [
    HelloCommand,
    BaseCommand,
    CompoundService,
    CommandsService,
    PingCommand,
    TimeCommand,
    TasksCommand,
    AuthCommand,
    ActivateCommand,
    ShakeCommand,
    BaseDiscordCommand,
    PromptPayCommand,
    YoutubeCommand,
    StreamCommand,
    PushCommand,
  ],
  imports: [
    TrelloModule,
    AudioModule,
    AuthModule,
    ConfigModule,
    LoggerModule,
    DiscordModule,
  ],
  exports: [CommandsService],
})
export class CommandsModule {}
