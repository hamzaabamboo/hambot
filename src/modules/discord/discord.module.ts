import { Module, forwardRef } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from '../messages/messages.module';
import { DiscordService } from './discord.service';

@Module({
  controllers: [DiscordController],
  imports: [ConfigModule, forwardRef(() => MessagesModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
