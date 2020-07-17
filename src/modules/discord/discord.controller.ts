import {
  Controller,
  LoggerService,
  Get,
  Query,
  HttpStatus,
  HttpException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { DiscordService } from './discord.service';
import { AppLogger } from '../logger/logger';
@Controller('discord')
export class DiscordController {
  private client: Client;
  public prefix = /^hamB (.*)$/;
  private isListening = false;
  private stopToken: string;
  //   private logger: LoggerService
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
      //   logger.debug('Discord connected');
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
        });
      }
      if (
        message.channel.type === 'text' &&
        this.prefix.test(message.content)
      ) {
        this.message.handleMessage({
          channel: 'discord',
          senderId: message.author.id,
          message: this.prefix.exec(message.content)[1],
          messageChannel: message.channel,
        });
      }
    });
    this.isListening = true;
  }
  @Get('/activate')
  toggle(@Query('token') token: string) {
    if (!token || !this.stopToken) {
      this.stopToken = Math.floor(Math.random() * 1e15).toString(16);
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
