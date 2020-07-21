import { Message } from '../messages/messages.model';
import { ModuleRef } from '@nestjs/core';

export interface CompoundResponse {
  isCompounding: boolean;
  message?: Message;
}
export class BaseCompoundHandler {
  public static startCommand = /^(echom)/;
  public static requiresAuth = true;
  public command = /(.*?)/;
  public endCommand = /^(end)/;

  public messages: Message[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private moduleRef: ModuleRef) {}

  matchStart(input: string): boolean {
    return this.command.test(input);
  }

  async handleInput(message: Message): Promise<CompoundResponse> {
    if (this.endCommand.test(message.message)) {
      return this.handleCompound(this.messages);
    }
    if (this.command.test(message.message)) {
      return this.addMessage(message);
    }
  }

  addMessage(msg: Message): CompoundResponse {
    this.messages.push(msg);
    return {
      isCompounding: true,
      message: {
        ...msg,
        message: "Message added, type 'end' to stop",
      },
    };
  }

  async handleCompound(messages: Message[]): Promise<CompoundResponse> {
    // Do nothing
    const { senderId, channel } = messages[0];
    return {
      isCompounding: false,
      message: {
        senderId,
        channel,
        message: messages
          .slice(1)
          .map(e => e.message)
          .join('\n'),
      },
    };
  }
}
