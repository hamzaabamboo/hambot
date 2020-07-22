import {
  Injectable,
  Inject,
  forwardRef,
  Get,
  Query,
  HttpException,
} from '@nestjs/common';
import {
  Client,
  Channel,
  DMChannel,
  TextChannel,
  MessageOptions,
} from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { AppLogger } from '../logger/logger';
import { generateRandomKey } from 'src/utils';

@Injectable()
export class DiscordService {
  private client: Client;
  public prefix = /^hamB (.*)$/;
  private isListening = false;
  private stopToken: string;

  constructor(
    config: ConfigService,
    @Inject(forwardRef(() => MessagesService))
    private message: MessagesService,
    private logger: AppLogger,
  ) {
    this.client = new Client();
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

  activate(token?: string) {
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
    this.toggleDiscord();
  }

  toggleDiscord(status?: boolean) {
    if (status ?? this.isListening) {
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

  async sendMessage(channel: Channel, message: MessageOptions) {
    const c = await this.client.channels.fetch(channel.id);
    switch (c.type) {
      case 'dm':
        await (c as DMChannel).send(message);
        break;
      case 'text':
        await (c as TextChannel).send(message);
        break;
    }
  }

  get getClient() {
    return this.client;
  }
}
