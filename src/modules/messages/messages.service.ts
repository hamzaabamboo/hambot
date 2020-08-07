import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Message, FileWithUrl } from './messages.model';
import { LineService } from '../line/line.service';
import { CommandsService } from '../commands/commands.service';
import { DiscordService } from '../discord/discord.service';
import { AppLogger } from '../logger/logger';
import { Client } from '@line/bot-sdk';
import { FacebookService } from '../facebook/facebook.service';
import { DiscordAPIError } from 'discord.js';

@Injectable()
export class MessagesService {
  constructor(
    private commandService: CommandsService,
    @Inject(forwardRef(() => LineService))
    private lineService: LineService,
    @Inject(forwardRef(() => DiscordService))
    private discordService: DiscordService,
    @Inject(forwardRef(() => FacebookService))
    private facebookService: FacebookService,
    private logger: AppLogger,
  ) {
    this.logger.setContext('MessageService');
  }

  async handleMessage(message: Message) {
    this.logger.debug(`Message From ${message.channel}`);
    let reply: Message;
    if (this.commandService.isCommand(message)) {
      reply = await this.commandService.handleCommand(message);
    } else {
      return;
    }
    switch (message.channel) {
      case 'line':
        this.sendMessage({
          ...reply,
          channel: 'line',
          replyToken: message.replyToken,
        });
        break;
      case 'discord':
        this.sendMessage({
          ...reply,
          channel: 'discord',
          messageChannel: message.messageChannel,
        });
        break;
      case 'facebook':
        this.sendMessage({
          ...reply,
          channel: 'facebook',
        });
        break;
    }
  }

  sendMessage(message: Message) {
    switch (message.channel) {
      case 'line':
        let lineMsg: Parameters<Client['replyMessage']>[1] = {
          type: 'text',
          text: message.message,
        };
        if (message.image) {
          lineMsg = {
            type: 'image',
            originalContentUrl: message.image[0].url,
            previewImageUrl: message.image[0].url,
          };
        }
        const files = message.files.filter((m): m is FileWithUrl => 'url' in m);

        if (files?.length > 0) {
          lineMsg = {
            type: 'text',
            text: message.message + '\n' + `${files[0].name} - ${files[0].url}`,
          };
        }
        if (message.pushTo) {
          return this.lineService
            .sendPushMessage(lineMsg, message.pushTo)
            .catch(e => {
              this.logger.error('Line error: ' + e.statusMessage);
            });
        }
        return this.lineService
          .sendReplyMessage(lineMsg, message.replyToken)
          .catch(e => {
            this.logger.error('Line error: ' + e.statusMessage);
          });
      case 'discord':
        const m = message;
        return this.discordService
          .sendMessage(m.messageChannel, {
            content: m.message,
            files: [
              ...(m.files
                ?.filter((m): m is FileWithUrl => 'url' in m)
                .map(m => ({
                  attachment: m.url,
                  name: m.name,
                })) ?? []),
              ...(m.files
                ?.filter((m): m is FileWithUrl => 'url' in m)
                .map(m => ({
                  attachment: m.url,
                  name: m.name,
                })) ?? []),
            ].filter(e => e),
          })
          .catch((e: DiscordAPIError) => {
            this.logger.error('Discord  error: ' + e.message);
          });
      case 'facebook':
        if (message.senderId) {
          return this.facebookService.sendReplyMessage(message).catch(e => {
            this.logger.error(e.data);
          });
        } else {
          return this.facebookService.sendPushMessage(message).catch(e => {
            this.logger.error(e.data);
          });
        }
    }
  }
}
