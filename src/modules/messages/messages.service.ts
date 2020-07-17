import { Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  Message,
  BaseMessage,
  LineMessage,
  DiscordMessage,
} from './messages.model';
import { LineService } from '../line/line.service';
import { CommandsService } from '../commands/commands.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class MessagesService {
  constructor(
    private commandService: CommandsService,
    @Inject(forwardRef(() => LineService))
    private lineService: LineService,
    @Inject(forwardRef(() => DiscordService))
    private discordService: DiscordService,
  ) {
    // this.lineService = this.moduleRef.get(LineService);
  }

  async handleMessage(message: Message) {
    console.log('Message from', message.channel);
    let reply: Message;
    if (this.commandService.isCommand(message)) {
      reply = await this.commandService.handleCommand(message);
    } else {
      reply = {
        channel: message.channel,
        senderId: message.senderId,
        message: 'Idk what to do sry',
      };
    }
    switch (message.channel) {
      case 'line':
        this.sendMessage({
          channel: 'line',
          ...reply,
          replyToken: (message as LineMessage).replyToken,
        } as LineMessage);
        break;
      case 'discord':
        this.sendMessage({
          ...reply,
          channel: 'discord',
          messageChannel: (message as DiscordMessage).messageChannel,
        } as DiscordMessage);
        break;
    }
  }

  sendMessage(message: Message) {
    switch (message.channel) {
      case 'line':
        if (message.image) {
          return this.lineService.sendReplyMessage(
            {
              type: 'image',
              originalContentUrl: message.image.url,
              previewImageUrl: message.image.url,
            },
            message.replyToken,
          );
        }
        return this.lineService
          .sendReplyMessage(
            {
              type: 'text',
              text: message.message,
            },
            message.replyToken,
          )
          .catch(e => {
            console.log(e.data);
          });
      case 'discord':
        const m = message as DiscordMessage;
        return this.discordService.sendMessage(m.messageChannel, {
          content: m.message,
          files: [
            m.image && {
              attachment: m.image.url,
              name: m.image.name,
            },
          ].filter(e => e),
        });
    }
  }
}
