import {
  Controller,
  Get,
  Query,
  HttpException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { DiscordService } from './discord.service';
import { AppLogger } from '../logger/logger';
import { generate } from 'rxjs';
import { generateRandomKey } from 'src/utils';
@Controller('discord')
export class DiscordController {
  private client: Client;
  public prefix = /^hamB (.*)$/;
  private isListening = false;
  private stopToken: string;

  constructor(
    config: ConfigService,
    service: DiscordService,
    @Inject(forwardRef(() => MessagesService))
    private message: MessagesService,
    private logger: AppLogger,
  ) {
    this.client = service.getClient;
    this.client.login(config.get('DISCORD_TOKEN'));
    this.logger.setContext('DiscordContext');
    this.listen();
  }

  listen() {
    if (this.isListening) return;
    this.client.on('ready', () => {
      this.logger.verbose('Discord Ready');
      this.client.user.setPresence({
        status: 'online',
        activity: {
          name: 'Beep Boop Beep Boop',
          type: 'CUSTOM_STATUS',
        },
      });
    });
    this.client.on('message', message => {
      if (message.author.id === this.client.user.id || message.author.bot)
        return;
      if (message.channel.type === 'dm') {
        this.message.handleMessage({
          channel: 'discord',
          senderId: message.author.id,
          message: message.content,
          messageChannel: message.channel,
          files: message.attachments.array().map(m => ({
            name: m.name,
            url: m.url,
          })),
        });
      }
      if (
        message.channel.type === 'text' &&
        (message.attachments.array().length > 0 ||
          this.prefix.test(message.content))
      ) {
        const cmd = this.prefix.exec(message.content);
        this.message.handleMessage({
          channel: 'discord',
          senderId: message.author.id,
          message:
            cmd && message.attachments.array().length === 0 ? cmd[1] : '',
          messageChannel: message.channel,
          files: message.attachments.array().map(m => ({
            name: m.name,
            url: m.url,
          })),
        });
      }
    });
    this.isListening = true;
  }
  @Get('/activate')
  toggle(@Query('token') token: string) {
    if (!token || !this.stopToken) {
      this.stopToken = generateRandomKey();
      this.logger.verbose('Stop token: ' + this.stopToken);
      return {
        message: 'Check token in console to stop',
      };
    }
    if (token !== this.stopToken) {
      throw new HttpException(
        {
          message: 'Wrong token',
        },
        400,
      );
    }
    if (this.isListening) {
      this.client.removeAllListeners();
      this.isListening = false;
      this.logger.verbose('Successfully Stopped Discord');
      return {
        message: 'Successfully Stopped Discord',
      };
    } else {
      this.listen();
      this.logger.verbose('Successfully Started Discord');
      return {
        message: 'Successfully Started Discord',
      };
    }
  }
}
