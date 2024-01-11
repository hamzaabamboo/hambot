import { REST } from '@discordjs/rest';
import {
  HttpException,
  Inject,
  Injectable,
  OnApplicationShutdown,
  forwardRef,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ActivityType,
  BaseMessageOptions,
  ChannelType,
  Client,
  DMChannel,
  TextBasedChannel,
  TextChannel,
} from 'discord.js';
import { AppConfigService } from 'src/config/app-config.service';
import { generateRandomKey } from 'src/utils';
import { setTimeout as sleep } from 'timers/promises';
import { CompoundService } from '../commands/compound.service';
import { AppLogger } from '../logger/logger';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class DiscordService implements OnApplicationShutdown {
  private client: Client;
  private restClient: REST;
  public prefix = /^hamB (.*)$/;
  public isReady: boolean | Promise<void> = false;
  private isListening = false;
  private stopToken: string;

  constructor(
    private config: AppConfigService,
    @Inject(forwardRef(() => MessagesService))
    private message: MessagesService,
    private logger: AppLogger,
    private moduleRef: ModuleRef,
  ) {
    this.client = new Client({
      intents: [
        'Guilds',
        'DirectMessages',
        'GuildMessages',
        'GuildMembers',
        'GuildVoiceStates',
        'MessageContent',
      ],
      presence: {
        status: 'online',
      },
    });
    this.prefix = config.BOT_PREFIX
      ? new RegExp(`^${config.BOT_PREFIX} (.*)$`)
      : /^hamB (.*)$/;
    this.logger.setContext('DiscordService');
    this.login();
  }
  onApplicationShutdown(signal?: string) {
    this.client.destroy();
  }

  async login(tries = 0) {
    if (tries > 5) {
      this.logger.error("Can't Login");
      return;
    }
    try {
      await this.client.login(this.config.DISCORD_TOKEN);
      this.restClient = new REST({ version: '9' }).setToken(
        this.config.DISCORD_TOKEN,
      );
      this.listen();
    } catch (m) {
      this.logger.error(
        'Login failed, tries: ' + tries + ' error message: ' + m,
      );
      await sleep(1000);
      this.login(tries + 1);
    }
  }

  async listen() {
    if (this.isListening) return;

    this.isReady = new Promise((resolve) => {
      this.client.on('ready', () => {
        this.logger.verbose('Discord Ready');
        this.client.user.setPresence({
          status: 'online',
          activities: [
            {
              name: ':zanyface:',
              type: ActivityType.Watching,
            },
          ],
        });
        resolve();
      });
    });

    await this.isReady;
    this.isReady = true;

    this.client.on('messageCreate', (message) => {
      if (message.author.id === this.client.user.id || message.author.bot)
        return;
      if (message.author.username.includes('YamaKJ') && Math.random() < 0.1) {
        this.sendMessage(message.channel, {
          content: 'Buu buu desu wa :P',
        });
      }
      if (message.channel.type === ChannelType.DM) {
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
        message.channel.type === ChannelType.GuildText &&
        (this.moduleRef
          .get(CompoundService, { strict: false })
          ?.isCompounding(message.author.id) ||
          this.prefix.test(message.content))
      ) {
        const cmd = this.prefix.exec(message.content);
        this.message.handleMessage({
          channel: 'discord',
          senderId: message.author.id,
          channelId: message.channel.id,
          discordMessage: message,
          message:
            cmd && message.attachments.toJSON().length === 0
              ? cmd[1]
              : message.content,
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

  async sendMessage(channel: TextBasedChannel, message: BaseMessageOptions) {
    const messageLength = message.content.length;
    const chunks = Math.ceil(messageLength / 2000);
    const c = await this.client.channels.fetch(channel.id);
    for (let i = 0; i < chunks; i++) {
      const chunk = {
        ...message,
        content: message.content?.substring(i * 2000, (i + 1) * 2000),
      };
      switch (c.type) {
        case ChannelType.DM:
          await (c as DMChannel).send(chunk);
          break;
        case ChannelType.GuildText:
          await (c as TextChannel).send(chunk);
          break;
      }
    }
  }

  get getClient() {
    return this.client;
  }
}
