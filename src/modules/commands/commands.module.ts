import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AudioModule } from '../audio/audio.module';
import { AuthModule } from '../auth/auth.module';
import { DiscordModule } from '../discord/discord.module';
import { LoggerModule } from '../logger/logger.module';
import { TrelloModule } from '../trello/trello.module';
import { AuthCommand } from './auth.command';
import { BaseCommand } from './command.base';
import { CommandsService } from './commands.service';
import { CompoundService } from './compound.service';
import { BaseDiscordCommand } from './discord/base.discord.command';
import { ShakeCommand } from './discord/shake.command';
import { YoutubeCommand } from './discord/youtube.command';
import { HelloCommand } from './hello.command';
import { PingCommand } from './ping.command';
import { PromptPayCommand } from './promptpay.command';
import { TasksCommand } from './tasks.command';
import { TimeCommand } from './time.command';
// import { StreamCommand } from './deprecated/stream.command';
import { RssModule } from '../rss/rss.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { ActivateCommand } from './activate.command';
import { ClipboardCommand } from './clipboard.command';
import { YomiageCommand } from './discord/yomiage.command';
import { FriendCommand } from './friend.command';
import { NyaaCommand } from './nyaa.command';
import { PushCommand } from './push.command';
import { RandomCommand } from './random.command';
import { RecurringCommand } from './recurring.command';

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
    // StreamCommand,
    PushCommand,
    RandomCommand,
    ClipboardCommand,
    NyaaCommand,
    RecurringCommand,
    FriendCommand,
    YomiageCommand
  ],
  imports: [
    forwardRef(() => DiscordModule),
    TrelloModule,
    AudioModule,
    AuthModule,
    ConfigModule,
    HttpModule,
    LoggerModule,
    RssModule,
    forwardRef(() => SchedulerModule),
  ],
  exports: [CommandsService],
})
export class CommandsModule {}
