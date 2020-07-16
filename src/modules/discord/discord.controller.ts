import { Controller, LoggerService } from '@nestjs/common';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { DiscordService } from './discord.service';
@Controller('discord')
export class DiscordController {
  private client: Client;
  //   private logger: LoggerService
  constructor(
    config: ConfigService,
    service: DiscordService,
    private message: MessagesService,
  ) {
    this.client = service.getClient;
    this.client.login(config.get('DISCORD_TOKEN'));
    this.client.on('ready', () => {
      this.client.user.setPresence({
        status: 'online',
        activity: {
          name: 'Beep Boop Beep Boop',
          type: 'CUSTOM_STATUS',
        },
      });
      //   logger.debug('Discord connected');
    });
    this.client.on('message', message => {
      if (message.channel.type === 'dm' || message.channel.type === 'text') {
        if (message.author.username.includes('hamzaabamboo')) {
          this.message.handleMessage({
            channel: 'discord',
            senderId: message.author.id,
            message: message.content,
            messageChannel: message.channel,
          });
        }
      }
    });
  }
}
