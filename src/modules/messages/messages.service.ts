import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Message } from './messages.model';
import { LineService } from '../line/line.service';
import { ModuleRef } from '@nestjs/core';
import { CommandsService } from '../commands/commands.service';

@Injectable()
export class MessagesService {
  constructor(
    private commandService: CommandsService,
    @Inject(forwardRef(() => LineService))
    private lineService: LineService,
  ) {
    // this.lineService = this.moduleRef.get(LineService);
  }

  async handleMessage(message: Message) {
    console.log('Message from', message.channel);
    if (this.commandService.isCommand(message)) {
      this.sendMessage(await this.commandService.handleCommand(message));
    } else {
      this.sendMessage({
        channel: message.channel,
        message: 'Idk what to do sry',
        replyToken: message.replyToken,
      });
    }
  }

  sendMessage(message: Message) {
    switch (message.channel) {
      case 'line':
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
    }
  }
}
