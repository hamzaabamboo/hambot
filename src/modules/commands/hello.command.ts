import { Injectable } from '@nestjs/common';
import { BaseCommand } from './base.command';
import { Message } from '../messages/messages.model';

@Injectable()
export class HelloCommand extends BaseCommand {
  public command = /^(hello|hi)/i;

  async handle(message: Message) {
    return {
      ...message,
      message: 'Hello World',
    };
  }
}
