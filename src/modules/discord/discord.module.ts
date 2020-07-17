import { Module, forwardRef } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from '../messages/messages.module';
import { DiscordService } from './discord.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  controllers: [DiscordController],
  imports: [ConfigModule, forwardRef(() => MessagesModule), LoggerModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
