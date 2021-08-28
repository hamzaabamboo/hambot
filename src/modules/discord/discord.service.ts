import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import {
  Client,
  Channel,
  DMChannel,
  TextChannel,
  MessageOptions,
  TextBasedChannels,
  Intents,
} from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { AppLogger } from '../logger/logger';
import { generateRandomKey } from 'src/utils';
import { sleep } from 'src/utils/sleep';

@Injectable()
export class DiscordService {
  private client: Client;
  public prefix = /^hamB (.*)$/;
  private isListening = false;
  private stopToken: string;

  constructor(
    private config: ConfigService,
    @Inject(forwardRef(() => MessagesService))
    private message: MessagesService,
    private logger: AppLogger,
  ) {
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
      presence: {
        status: 'online',
      },
    });
    this.logger.setContext('DiscordService');
    this.login();
  }

  async login(tries = 0) {
    if (tries > 5) {
      this.logger.error("Can't Login");
      return;
    }
    try {
      await this.client.login(this.config.get('DISCORD_TOKEN'));
      this.listen();
    } catch (m) {
      this.logger.error(
        'Login failed, tries: ' + tries + ' error message: ' + m,
      );
      await sleep(1000);
      this.login(tries + 1);
    }
  }

  listen() {
    if (this.isListening) return;
    this.client.on('ready', () => {
      this.logger.verbose('Discord Ready');
      this.client.user.setPresence({
        status: 'online',
        activities: [
          {
            name: 'simps',
            type: 'WATCHING',
          },
        ],
      });
    });

    this.client.on('messageCreate', (message) => {
      if (message.author.id === this.client.user.id || message.author.bot)
        return;
      if (message.author.username.includes('YamaKJ') && Math.random() < 0.1) {
        this.sendMessage(message.channel, {
          content: 'Buu buu desu wa :P',
        });
        return;
      }
      if (message.channel.type === 'DM') {
        this.message.handleMessage({
          channel: 'discord',
          senderId: message.author.id,
          channelId: message.channel.id,
          discordMessage: message,
          message: message.content,
          messageChannel: message.channel,
          files: message.attachments.toJSON().map((m) => ({
            name: m.name,
            url: m.url,
          })),
        });
      }
      if (
        message.channel.type === 'GUILD_TEXT' &&
        (message.attachments.toJSON().length > 0 ||
          this.prefix.test(message.content))
      ) {
        const cmd = this.prefix.exec(message.content);
        this.message.handleMessage({
          channel: 'discord',
          senderId: message.author.id,
          channelId: message.channel.id,
          discordMessage: message,
          message:
            cmd && message.attachments.toJSON().length === 0 ? cmd[1] : '',
          messageChannel: message.channel,
          files: message.attachments.toJSON().map((m) => ({
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

  async sendMessage(channel: TextBasedChannels, message: MessageOptions) {
    const c = await this.client.channels.fetch(channel.id);
    switch (c.type) {
      case 'DM':
        await (c as DMChannel).send(message);
        break;
      case 'GUILD_TEXT':
        await (c as TextChannel).send(message);
        break;
    }
  }

  get getClient() {
    return this.client;
  }
}
